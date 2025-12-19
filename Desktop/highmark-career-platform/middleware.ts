import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 允许访问登录页面和API路由
        if (req.nextUrl.pathname.startsWith("/login") || 
            req.nextUrl.pathname.startsWith("/api")) {
          return true
        }
        // 其他页面需要认证
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}

