#!/bin/bash

# 端口检查脚本
# 用于检查项目所需端口是否可用

echo "==================================="
echo "  Daily AI Insight Engine"
echo "  端口占用检查"
echo "==================================="
echo ""

# 定义端口
BACKEND_PORT=3000
FRONTEND_PORT=5173

# 检查后端端口
echo "🔧 检查后端端口 $BACKEND_PORT..."
if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
    echo "   ❌ 端口 $BACKEND_PORT 已被占用"
    echo "   占用进程："
    lsof -ti:$BACKEND_PORT | xargs ps -p
    echo ""
    echo "   释放端口命令："
    echo "   lsof -ti:$BACKEND_PORT | xargs kill -9"
    BACKEND_AVAILABLE=false
else
    echo "   ✓ 端口 $BACKEND_PORT 可用"
    BACKEND_AVAILABLE=true
fi

echo ""

# 检查前端端口
echo "🎨 检查前端端口 $FRONTEND_PORT..."
if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
    echo "   ❌ 端口 $FRONTEND_PORT 已被占用"
    echo "   占用进程："
    lsof -ti:$FRONTEND_PORT | xargs ps -p
    echo ""
    echo "   释放端口命令："
    echo "   lsof -ti:$FRONTEND_PORT | xargs kill -9"
    FRONTEND_AVAILABLE=false
else
    echo "   ✓ 端口 $FRONTEND_PORT 可用"
    FRONTEND_AVAILABLE=true
fi

echo ""
echo "==================================="

# 总结
if [ "$BACKEND_AVAILABLE" = true ] && [ "$FRONTEND_AVAILABLE" = true ]; then
    echo "✅ 所有端口可用，可以启动服务！"
    echo ""
    echo "启动命令："
    echo "  yarn dev"
    exit 0
else
    echo "⚠️  部分端口被占用，请先释放端口"
    echo ""
    echo "快速释放所有端口："
    echo "  lsof -ti:$BACKEND_PORT -ti:$FRONTEND_PORT | xargs kill -9"
    exit 1
fi
