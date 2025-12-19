'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Copy, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchingLoader } from '@/components/MatchingLoader';
import { MatchResult } from '@/lib/deepseek';
import * as XLSX from 'xlsx';

type Stage = 'input' | 'loading' | 'results';

const STAGES = [
  { progress: 30, text: '正在初始化海马AI引擎...' },
  { progress: 60, text: '正在深度解析简历画像...' },
  { progress: 90, text: '正在比对 5000+ 独家岗位库...' },
  { progress: 100, text: '匹配完成！' },
];

export default function CoachPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('input');
  const [resume, setResume] = useState('');
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStageText, setCurrentStageText] = useState(STAGES[0].text);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);

  // 检查认证
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    
    if (isAuthenticated !== 'true' || userRole !== 'coach') {
      router.push('/');
    }
  }, [router]);

  // 模拟提取关键词（实际应该从AI返回）
  const extractKeywords = (text: string): string[] => {
    const keywords: string[] = [];
    const commonSkills = ['数据分析', '产品经理', 'Python', 'Java', '项目管理', '市场营销', '运营', '设计', '前端', '后端'];
    commonSkills.forEach(skill => {
      if (text.includes(skill)) {
        keywords.push(skill);
      }
    });
    return keywords.slice(0, 5);
  };

  const handleMatch = async () => {
    if (!resume.trim()) {
      return;
    }

    setStage('loading');
    setLoadingProgress(0);
    setCurrentStageText(STAGES[0].text);
    setExtractedKeywords([]);

    // 阶段1: 初始化 (0-30%)
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoadingProgress(30);
    setCurrentStageText(STAGES[1].text);

    // 阶段2: 解析简历 (30-60%)
    const keywords = extractKeywords(resume);
    setExtractedKeywords(keywords);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoadingProgress(60);
    setCurrentStageText(STAGES[2].text);

    // 阶段3: 比对岗位 (60-90%)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoadingProgress(90);

    // 调用API进行匹配
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      }).catch((fetchError) => {
        // 处理网络错误
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          throw new Error('网络连接失败，请检查：\n1. 开发服务器是否正常运行\n2. 网络连接是否正常\n3. Supabase 配置是否正确');
        }
        throw fetchError;
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: 请求失败` };
        }
        
        // 提供更友好的错误信息
        let errorMessage = errorData.error || `HTTP ${response.status}: 匹配失败`;
        if (errorMessage.includes('Supabase') || errorMessage.includes('数据库')) {
          errorMessage = '数据库连接失败。请检查：\n1. Supabase 环境变量是否已配置\n2. 数据库表是否已创建\n3. 网络连接是否正常';
        } else if (errorMessage.includes('DeepSeek') || errorMessage.includes('API')) {
          errorMessage = 'AI 匹配服务失败。请检查：\n1. DeepSeek API Key 是否已配置\n2. API 配额是否充足\n3. 网络连接是否正常';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // 阶段4: 完成 (90-100%)
      setLoadingProgress(100);
      setCurrentStageText(STAGES[3].text);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setMatchResults(data.results || []);
      setStage('results');
    } catch (error) {
      console.error('Match error:', error);
      let errorMessage = '匹配失败，请稍后重试';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // 如果是配置相关错误，提供更详细的提示
        if (error.message.includes('Supabase') || error.message.includes('数据库')) {
          errorMessage = error.message + '\n\n💡 提示：请参考 ENV_SETUP.md 配置 Supabase';
        } else if (error.message.includes('DeepSeek') || error.message.includes('API')) {
          errorMessage = error.message + '\n\n💡 提示：请参考 ENV_SETUP.md 配置 DeepSeek API';
        }
      }
      
      alert(errorMessage);
      setStage('input');
      setLoadingProgress(0);
      setCurrentStageText(STAGES[0].text);
    }
  };

  const handleCopyWeChatMessage = async () => {
    if (matchResults.length === 0) return;

    let message = '👋同学你好，海马职加为你筛选了今日高匹配岗位：\n\n';
    
    matchResults.forEach((result, index) => {
      message += `${index + 1}. [${result.job.company}] ${result.job.roles} - ${result.job.location} (匹配度${result.score}%)\n`;
      message += `🔗投递：${result.job.link}\n`;
      message += `\n建议：${result.reason}\n\n`;
    });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        alert('微信话术已复制到剪贴板！');
      } else {
        // 降级方案：使用传统方法
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('微信话术已复制到剪贴板！');
        } catch (err) {
          alert('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  const handleExportExcel = () => {
    if (matchResults.length === 0) return;

    const worksheetData = matchResults.map((result, index) => ({
      序号: index + 1,
      公司: result.job.company,
      岗位: result.job.roles,
      地点: result.job.location,
      匹配度: `${result.score}%`,
      推荐理由: result.reason,
      投递链接: result.job.link,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '匹配结果');
    
    // 设置列宽
    const colWidths = [
      { wch: 6 },  // 序号
      { wch: 15 }, // 公司
      { wch: 20 }, // 岗位
      { wch: 10 }, // 地点
      { wch: 10 }, // 匹配度
      { wch: 40 }, // 推荐理由
      { wch: 50 }, // 链接
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `海马职加匹配结果_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回登录
          </Button>
          <h1 className="font-serif text-4xl font-bold text-[#0F172A] mb-2">
            全息匹配驾驶舱
          </h1>
          <p className="text-slate-600">
            输入学生简历，AI将为你匹配最适合的岗位
          </p>
        </motion.div>

        {/* 输入阶段 */}
        <AnimatePresence mode="wait">
          {stage === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    粘贴学生简历
                  </CardTitle>
                  <CardDescription>
                    支持纯文本格式，系统将自动提取关键信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="请输入学生的简历内容..."
                    className="min-h-[400px]"
                  />
                  <Button
                    onClick={handleMatch}
                    disabled={!resume.trim()}
                    className="mt-4 w-full bg-[#0F172A] hover:bg-[#1E293B] h-12 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始匹配
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 加载阶段 */}
          {stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <MatchingLoader
                    progress={loadingProgress}
                    currentStage={currentStageText}
                    keywords={extractedKeywords}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 结果阶段 */}
          {stage === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 操作按钮 */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={handleCopyWeChatMessage}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制微信话术
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出Excel
                </Button>
                <Button
                  onClick={() => {
                    setStage('input');
                    setResume('');
                    setMatchResults([]);
                  }}
                  variant="ghost"
                >
                  重新匹配
                </Button>
              </div>

              {/* 结果卡片 */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matchResults.map((result, index) => (
                  <motion.div
                    key={result.job.id || `result-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">
                              {result.job.company}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {result.job.roles}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`text-sm ${
                              result.score >= 90
                                ? 'bg-green-100 text-green-700'
                                : result.score >= 80
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {result.score}% Match
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          📍 {result.job.location}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                          {result.reason}
                        </p>
                        <a
                          href={result.job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#D97706] hover:underline font-medium"
                        >
                          查看详情 →
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {matchResults.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-500">
                    暂无匹配结果
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

