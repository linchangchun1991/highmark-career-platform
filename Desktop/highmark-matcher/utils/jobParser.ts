/**
 * 岗位解析工具
 * 解析格式：公司名 | 职位1, 职位2 | 地点 | 链接
 * 示例：4399 | 产品类，技术类 | 广州 | https://mp.weixin.qq.com/s/xxxx
 */

export interface ParsedJob {
  rawText: string;
  company: string;
  roles: string;
  location: string;
  link: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 清洗URL，删除查询参数
 * @param url 原始URL
 * @returns 清洗后的URL
 */
function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // 移除所有查询参数
    urlObj.search = '';
    return urlObj.toString();
  } catch (error) {
    // 如果不是有效URL，尝试简单处理
    const questionMarkIndex = url.indexOf('?');
    if (questionMarkIndex !== -1) {
      return url.substring(0, questionMarkIndex);
    }
    return url;
  }
}

/**
 * 检测是否为URL
 */
function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * 解析单行岗位数据
 * @param line 单行文本
 * @param lineNumber 行号（用于错误提示）
 * @returns 解析结果
 */
export function parseJobLine(line: string, lineNumber: number): ParsedJob {
  const rawText = line.trim();
  
  // 空行跳过
  if (!rawText) {
    return {
      rawText,
      company: '',
      roles: '',
      location: '',
      link: '',
      isValid: false,
      errorMessage: '空行',
    };
  }

  // 按 | 分割
  const parts = rawText.split('|').map(part => part.trim());
  
  if (parts.length < 4) {
    return {
      rawText,
      company: parts[0] || '',
      roles: parts[1] || '',
      location: parts[2] || '',
      link: parts[3] || '',
      isValid: false,
      errorMessage: `格式错误：缺少必要字段（需要4个字段，用 | 分隔）`,
    };
  }

  const [company, roles, location, link] = parts;

  // 验证必填字段
  if (!company) {
    return {
      rawText,
      company: '',
      roles: roles || '',
      location: location || '',
      link: link || '',
      isValid: false,
      errorMessage: '公司名不能为空',
    };
  }

  if (!roles) {
    return {
      rawText,
      company,
      roles: '',
      location: location || '',
      link: link || '',
      isValid: false,
      errorMessage: '岗位不能为空',
    };
  }

  if (!location) {
    return {
      rawText,
      company,
      roles,
      location: '',
      link: link || '',
      isValid: false,
      errorMessage: '地点不能为空',
    };
  }

  if (!link) {
    return {
      rawText,
      company,
      roles,
      location,
      link: '',
      isValid: false,
      errorMessage: '链接不能为空',
    };
  }

  // 验证链接格式
  if (!isUrl(link)) {
    return {
      rawText,
      company,
      roles,
      location,
      link,
      isValid: false,
      errorMessage: '链接格式无效',
    };
  }

  // 清洗链接
  const cleanedLink = cleanUrl(link);

  return {
    rawText,
    company,
    roles,
    location,
    link: cleanedLink,
    isValid: true,
  };
}

/**
 * 批量解析岗位数据
 * @param text 多行文本
 * @returns 解析结果数组
 */
export function parseJobs(text: string): ParsedJob[] {
  const lines = text.split('\n');
  return lines.map((line, index) => parseJobLine(line, index + 1));
}

/**
 * 统计解析结果
 */
export function getParseStats(parsedJobs: ParsedJob[]) {
  const total = parsedJobs.length;
  const valid = parsedJobs.filter(job => job.isValid).length;
  const invalid = total - valid;
  
  return {
    total,
    valid,
    invalid,
  };
}

