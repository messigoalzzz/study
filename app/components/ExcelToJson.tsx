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
  const [copiedRows, setCopiedRows] = useState<Set<number>>(new Set())

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
    setCopiedRows(new Set()) // 重置复制状态

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
  // const downloadJson = () => {
  //   if (!jsonData) return
    
  //   const dataStr = JSON.stringify(jsonData, null, 2)
  //   const dataBlob = new Blob([dataStr], { type: 'application/json' })
  //   const url = URL.createObjectURL(dataBlob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = `${fileName.replace(/\.[^/.]+$/, '')}.json`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  //   URL.revokeObjectURL(url)
  // }

  // 复制单行JSON数据到剪贴板
  const copyRowJson = async (rowData: ExcelData, rowIndex: number) => {
    const jsonStr = JSON.stringify(rowData, null, 2)
    
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr)
        // 标记该行为已复制
        setCopiedRows(prev => new Set([...prev, rowIndex]))
        showCopySuccess()
      } else {
        // 备用方法：使用传统的 execCommand
        fallbackCopyToClipboard(jsonStr, rowIndex)
      }
    } catch (err) {
      console.error('复制失败:', err)
      // 如果现代API失败，尝试备用方法
      try {
        fallbackCopyToClipboard(jsonStr, rowIndex)
      } catch (fallbackErr) {
        console.error('备用复制方法也失败:', fallbackErr)
        // 最后的备用方案：显示文本让用户手动复制
        showManualCopyDialog(jsonStr)
      }
    }
  }

  // 备用复制方法
  const fallbackCopyToClipboard = (text: string, rowIndex: number) => {
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
      // 标记该行为已复制
      setCopiedRows(prev => new Set([...prev, rowIndex]))
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
      top: 12%;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transition: all 0.3s ease;
      border: 2px solid #059669;
      pointer-events: none;
    `
    
    document.body.appendChild(toast)
    
    // 2秒后自动消失
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(-50%) translateY(-20px) scale(0.98)'
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

  // 获取统一社会信用代码
  const getCreditCode = (rowData: ExcelData): string => {
    const possibleFields = ['统一社会信用代码', '信用代码', '社会信用代码', '信用代码', 'code', 'credit_code']
    for (const field of possibleFields) {
      if (rowData[field] && String(rowData[field]).trim()) {
        return String(rowData[field]).trim()
      }
    }
    return '-'
  }

  // 获取bossurl
  const getBossUrl = (rowData: ExcelData): string => {
    const possibleFields = ['bossurl', 'boss_url', 'boss链接', 'boss地址', 'url', '链接']
    for (const field of possibleFields) {
      if (rowData[field] && String(rowData[field]).trim()) {
        return String(rowData[field]).trim()
      }
    }
    return '-'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel 转 JSON 工具</h1>
        <p className="text-gray-600">支持拖拽上传Excel文件，加油🤯</p>
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
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              {fileName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 shadow">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M9 8h.01M7 4h7a2 2 0 011.414.586l3 3A2 2 0 0119 9v9a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                  {fileName.replace(/\.[^/.]+$/, '')}
                </span>
              )}
              {/* <span>生成的JSON数据</span> */}
            </h2>
            {/* <button
              onClick={downloadJson}
              className="px-1 py-1 bg-black/50 text-white rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              下载完整JSON
            </button> */}
          </div>
          
          {/* 表格显示数据 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      序号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      统一社会信用代码
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BossURL
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jsonData.map((rowData, index) => {
                    const companyName = getCompanyName(rowData)
                    const creditCode = getCreditCode(rowData)
                    const bossUrl = getBossUrl(rowData)
                    
                    const isCopied = copiedRows.has(index)
                    
                    return (
                      <tr key={index} className={`transition-colors ${isCopied ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${isCopied ? 'border-l-4 border-green-400' : ''}`}>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${isCopied ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={companyName}>
                            {companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate font-mono text-xs" title={creditCode}>
                            {creditCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={bossUrl}>
                            {bossUrl !== '-' ? (
                              <a 
                                href={bossUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {bossUrl}
                              </a>
                            ) : (
                              <span className="text-gray-400">{bossUrl}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => copyRowJson(rowData, index)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform ${
                              isCopied 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 focus:ring-green-500' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 focus:ring-blue-500'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                已复制
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                复制JSON
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
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
