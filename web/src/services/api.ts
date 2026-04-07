/**
 * API服务
 * 负责与后端API通信
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
  /**
   * 获取最新报告
   */
  static async getLatestReport(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/latest`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] 获取最新报告失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取指定日期的报告
   */
  static async getReportByDate(date: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${date}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API] 获取报告失败 (${date}):`, error);
      throw error;
    }
  }
  
  /**
   * 生成新报告
   */
  static async generateReport(date?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: date || new Date().toISOString().split('T')[0] }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] 生成报告失败:', error);
      throw error;
    }
  }
  
  /**
   * 健康检查
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('[API] 健康检查失败:', error);
      return false;
    }
  }
}
