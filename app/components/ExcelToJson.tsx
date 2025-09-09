'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'

interface ExcelData {
  [key: string]: unknown
}

const ExcelToJson: React.FC = () => {
  const [jsonData, setJsonData] = useState<ExcelData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  // 拆分福利待遇字段的函数，与Python版本保持一致
  const splitBenefits = (val: unknown): string[] => {
    if (!val || val === null || val === undefined) {
      return []
    }
    // 支持中英文逗号、分号、顿号
    const text = String(val).replace(/，/g, ',').replace(/；/g, ',').replace(/、/g, ',')
    const parts = text.split(',')
    return parts.map(p => p.trim()).filter(p => p.length > 0)
  }

  // 处理Excel文件的函数
  const processExcelFile = useCallback((file: File) => {
    setLoading(true)
    setError('')
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 默认使用第一个sheet
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]
        const jsonResult: ExcelData[] = XLSX.utils.sheet_to_json(worksheet)
        
        // 处理福利待遇字段，与Python版本保持一致
        const processedData = jsonResult.map(row => {
          if ('福利待遇' in row) {
            return {
              ...row,
              '福利待遇': splitBenefits(row['福利待遇'])
            }
          }
          return row
        })
        
        setJsonData(processedData)
        setError('')
        
      } catch (err) {
        setError(`文件处理失败: ${err instanceof Error ? err.message : '未知错误'}`)
      } finally {
        setLoading(false)
      }
    }
    
    reader.onerror = () => {
      setError('文件读取失败')
      setLoading(false)
    }
    
    reader.readAsArrayBuffer(file)
  }, [])

  // 拖拽配置
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      processExcelFile(file)
    }
  }, [processExcelFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false
  })

  // 下载JSON文件
  const downloadJson = () => {
    if (!jsonData) return
    
    const dataStr = JSON.stringify(jsonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName.replace(/\.[^/.]+$/, '')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 复制单行JSON数据到剪贴板
  const copyRowJson = async (rowData: ExcelData) => {
    const jsonStr = JSON.stringify(rowData, null, 2)
    
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr)
        showCopySuccess()
      } else {
        // 备用方法：使用传统的 execCommand
        fallbackCopyToClipboard(jsonStr)
      }
    } catch (err) {
      console.error('复制失败:', err)
      // 如果现代API失败，尝试备用方法
      try {
        fallbackCopyToClipboard(jsonStr)
      } catch (fallbackErr) {
        console.error('备用复制方法也失败:', fallbackErr)
        // 最后的备用方案：显示文本让用户手动复制
        showManualCopyDialog(jsonStr)
      }
    }
  }

  // 备用复制方法
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      showCopySuccess()
    } else {
      throw new Error('execCommand copy failed')
    }
  }

  // 显示复制成功提示
  const showCopySuccess = () => {
    // 创建一个简单的提示消息
    const toast = document.createElement('div')
    toast.textContent = '✅ 复制成功!'
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transition: all 0.3s ease;
    `
    
    document.body.appendChild(toast)
    
    // 3秒后自动消失
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 2000)
  }

  // 显示手动复制对话框
  const showManualCopyDialog = (text: string) => {
    const message = `自动复制失败，请手动复制以下内容：\n\n${text}`
    if (window.prompt) {
      window.prompt('请复制以下内容（Ctrl+C）：', text)
    } else {
      alert(message)
    }
  }

  // 获取公司名称，尝试多个可能的字段名
  const getCompanyName = (rowData: ExcelData): string => {
    const possibleFields = ['公司名称', '企业名称', '公司', '企业', '单位名称', '单位', 'company', 'name']
    for (const field of possibleFields) {
      if (rowData[field] && String(rowData[field]).trim()) {
        return String(rowData[field]).trim()
      }
    }
    return '未知公司'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel 转 JSON 工具</h1>
        <p className="text-gray-600">支持拖拽上传Excel文件，自动处理福利待遇字段转数组</p>
      </div>

      {/* 文件上传区域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600">拖放Excel文件到这里...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">拖拽Excel文件到这里，或点击选择文件</p>
              <p className="text-sm text-gray-400">支持 .xlsx 和 .xls 格式</p>
            </div>
          )}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">处理中...</span>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}


      {/* JSON结果显示 */}
      {jsonData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">生成的JSON数据</h2>
            <button
              onClick={downloadJson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              下载完整JSON
            </button>
          </div>
          
          {/* 按行显示数据 */}
          <div className="space-y-4">
            {jsonData.map((rowData, index) => {
              const companyName = getCompanyName(rowData)
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {companyName}
                      </h3>
                    </div>
                    <button
                      onClick={() => copyRowJson(rowData)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      复制
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-64">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(rowData, null, 2)}
                    </pre>
                  </div>
                </div>
              )
            })}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                共 {jsonData.length} 条记录
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelToJson
