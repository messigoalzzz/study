// lib/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 扩展 Axios 配置类型
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestStartTime: number;
  };
}

interface CustomAxiosResponse extends AxiosResponse {
  config: CustomInternalAxiosRequestConfig;
}


const apiClient = axios.create({
  baseURL: 'https://api10.test.moonpump.me',
  timeout: 60000,
});

// 保留原有的请求拦截器
apiClient.interceptors.request.use((config: CustomInternalAxiosRequestConfig) => {
  // 添加请求开始时间
  config.metadata = { requestStartTime: Date.now() };
  

   if (config.url?.startsWith('/capi')) {
    config.baseURL = 'https://api10.test.moonpump.me';  // 设置capi的baseURL
  } else if (config.url?.startsWith('/api')) {
    config.baseURL = 'https://api10.test.moonpump.me';  // 设置api的baseURL
  }
  
  return config;
});



// 添加响应拦截器
apiClient.interceptors.response.use(
  (response: CustomAxiosResponse) => {

    return response;
  },
  (error) => {
 
    return Promise.reject(error);
  }
);

// 修改 ResOptions 的类型定义
export interface ResOptions<T = unknown> {
  code: number;
  data: T;
  message?: string;
}

// 修改便捷方法的返回类型
export const http = {
  async get<T = unknown>(url: string, params?: object): Promise<ResOptions<T>> {
    const { data } = await apiClient.get(url, { params });
    return data;
  },
  
  async post<T = unknown>(url: string, body?: unknown): Promise<ResOptions<T>> {
    const { data } = await apiClient.post(url, body);
    return data;
  }
};

export default apiClient;
