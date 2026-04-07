/**
 * API服务 - 与后端通信
 */

import type { InsightReport } from '../types/report';
import { ReportAdapter } from './reportAdapter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
  /**
   * 获取最新报告
   */
  static async getLatestReport(language: 'zh' | 'en' = 'zh'): Promise<InsightReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/latest?lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }
      
      const backendData = await response.json();
      // 转换后端数据格式为前端格式
      return ReportAdapter.adaptBackendReport(backendData);
    } catch (error) {
      console.error('Error fetching latest report:', error);
      throw error;
    }
  }
  
  /**
   * 获取指定日期的报告
   */
  static async getReportByDate(date: string, language: 'zh' | 'en' = 'zh'): Promise<InsightReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${date}?lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }
      
      const backendData = await response.json();
      // 转换后端数据格式为前端格式
      return ReportAdapter.adaptBackendReport(backendData);
    } catch (error) {
      console.error(`Error fetching report for date ${date}:`, error);
      throw error;
    }
  }
  
  /**
   * 生成新报告
   */
  static async generateReport(date?: string, language: 'zh' | 'en' = 'zh'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, lang: language }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}
