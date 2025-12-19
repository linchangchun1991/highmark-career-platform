'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GraduationCap, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Role = 'coach' | 'bd' | null;

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const ACCESS_CODE = 'haima2025';

  const handleRoleSelect = (role: 'coach' | 'bd') => {
    setSelectedRole(role);
    setError('');
  };

  const handleLogin = () => {
    if (!selectedRole) {
      setError('请先选择角色');
      return;
    }

    if (accessCode !== ACCESS_CODE) {
      setError('访问码错误');
      return;
    }

    // 保存角色到 sessionStorage
    sessionStorage.setItem('userRole', selectedRole);
    sessionStorage.setItem('isAuthenticated', 'true');

    // 跳转到对应页面
    if (selectedRole === 'coach') {
      router.push('/coach');
    } else {
      router.push('/bd');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* 标题 */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-5xl font-bold text-[#0F172A] mb-4"
          >
            海马职加
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-600"
          >
            人岗匹配系统
          </motion.p>
        </div>

        {/* 角色选择卡片 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedRole === 'coach'
                  ? 'ring-2 ring-[#D97706] shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleSelect('coach')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedRole === 'coach' ? 'bg-[#D97706]' : 'bg-slate-100'
                  }`}>
                    <GraduationCap
                      className={`w-6 h-6 ${
                        selectedRole === 'coach' ? 'text-white' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <CardTitle className="text-2xl">我是教练</CardTitle>
                </div>
                <CardDescription className="text-base mt-2">
                  为学生匹配最适合的岗位
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedRole === 'bd'
                  ? 'ring-2 ring-[#D97706] shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleSelect('bd')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedRole === 'bd' ? 'bg-[#D97706]' : 'bg-slate-100'
                  }`}>
                    <Briefcase
                      className={`w-6 h-6 ${
                        selectedRole === 'bd' ? 'text-white' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <CardTitle className="text-2xl">我是BD</CardTitle>
                </div>
                <CardDescription className="text-base mt-2">
                  上传和管理岗位信息
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* 访问码输入 */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>输入访问码</CardTitle>
                <CardDescription>
                  请输入系统访问码以继续
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder="访问码"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                  className="text-lg h-12"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
                <Button
                  onClick={handleLogin}
                  className="w-full h-12 text-lg bg-[#0F172A] hover:bg-[#1E293B]"
                >
                  进入系统
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
