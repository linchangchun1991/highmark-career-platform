'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseJobs, ParsedJob, getParseStats } from '@/utils/jobParser';

export default function BDPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [parsedJobs, setParsedJobs] = useState<ParsedJob[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // 检查认证
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    
    if (isAuthenticated !== 'true' || userRole !== 'bd') {
      router.push('/');
    }
  }, [router]);

  const handleParse = () => {
    if (!inputText.trim()) {
      return;
    }
    const parsed = parseJobs(inputText);
    setParsedJobs(parsed);
    setSubmitResult(null);
  };

  const handleSubmit = async () => {
    const validJobs = parsedJobs.filter(job => job.isValid);
    
    if (validJobs.length === 0) {
      setSubmitResult({
        success: false,
        message: '没有有效的岗位数据可提交',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobs: validJobs }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '提交失败' }));
        setSubmitResult({
          success: false,
          message: errorData.error || `HTTP ${response.status}: 提交失败`,
        });
        return;
      }

      const data = await response.json();
      setSubmitResult({
        success: true,
        message: `成功入库 ${data.inserted} 个岗位！`,
      });
      // 清空输入和解析结果
      setInputText('');
      setParsedJobs([]);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : '网络错误，请稍后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getParseStats(parsedJobs);

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
            岗位智能清洗引擎
          </h1>
          <p className="text-slate-600">
            粘贴岗位数据，系统将自动解析并清洗链接
          </p>
        </motion.div>

        {/* 输入区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>粘贴岗位数据</CardTitle>
            <CardDescription>
              格式：公司名 | 职位1, 职位2 | 地点 | 链接（每行一个岗位）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="4399 | 产品类，技术类 | 广州 | https://mp.weixin.qq.com/s/xxxx"
              className="min-h-[300px] font-mono text-sm"
              onPaste={(e) => {
                // 粘贴后自动解析
                setTimeout(() => {
                  handleParse();
                }, 100);
              }}
            />
            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleParse}
                disabled={!inputText.trim()}
                className="bg-[#0F172A] hover:bg-[#1E293B]"
              >
                <Upload className="w-4 h-4 mr-2" />
                解析数据
              </Button>
              {parsedJobs.length > 0 && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    有效: {stats.valid}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    无效: {stats.invalid}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 解析结果表格 */}
        <AnimatePresence>
          {parsedJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>解析预览</CardTitle>
                  <CardDescription>
                    请检查解析结果，无效数据已高亮显示
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>状态</TableHead>
                          <TableHead>公司</TableHead>
                          <TableHead>岗位</TableHead>
                          <TableHead>地点</TableHead>
                          <TableHead>链接</TableHead>
                          <TableHead>错误信息</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedJobs.map((job, index) => (
                          <TableRow
                            key={index}
                            className={job.isValid ? '' : 'bg-red-50'}
                          >
                            <TableCell>
                              {job.isValid ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {job.company || '-'}
                            </TableCell>
                            <TableCell>{job.roles || '-'}</TableCell>
                            <TableCell>{job.location || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {job.link || '-'}
                              </a>
                            </TableCell>
                            <TableCell className="text-sm text-red-600">
                              {job.errorMessage || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || stats.valid === 0}
                      className="bg-[#D97706] hover:bg-[#B45309] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          提交中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          确认入库 ({stats.valid} 个)
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提交结果提示 */}
        <AnimatePresence>
          {submitResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-8 right-8"
            >
              <Card className={submitResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {submitResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={submitResult.success ? 'text-green-800' : 'text-red-800'}>
                      {submitResult.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

