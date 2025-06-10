#!/bin/bash

echo "🚀 微信公众号HTML插件安装脚本"
echo "=================================="

# 检查是否存在必要文件
if [ ! -f "manifest.json" ]; then
    echo "❌ 错误: 未找到 manifest.json 文件"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查图标文件
echo "📋 检查图标文件..."
icon_files=("icons/icon16.png" "icons/icon32.png" "icons/icon48.png" "icons/icon128.png")
missing_icons=()

for icon in "${icon_files[@]}"; do
    if [ ! -f "$icon" ]; then
        missing_icons+=("$icon")
    fi
done

if [ ${#missing_icons[@]} -gt 0 ]; then
    echo "⚠️  缺少图标文件，尝试从SVG生成..."
    
    # 检查转换工具
    if command -v rsvg-convert &> /dev/null; then
        echo "✅ 使用 rsvg-convert 生成图标..."
        rsvg-convert -w 16 -h 16 icons/icon.svg -o icons/icon16.png
        rsvg-convert -w 32 -h 32 icons/icon.svg -o icons/icon32.png
        rsvg-convert -w 48 -h 48 icons/icon.svg -o icons/icon48.png
        rsvg-convert -w 128 -h 128 icons/icon.svg -o icons/icon128.png
        echo "✅ 图标文件生成完成"
    elif command -v convert &> /dev/null; then
        echo "✅ 使用 ImageMagick 生成图标..."
        convert icons/icon.svg -resize 16x16 icons/icon16.png
        convert icons/icon.svg -resize 32x32 icons/icon32.png
        convert icons/icon.svg -resize 48x48 icons/icon48.png
        convert icons/icon.svg -resize 128x128 icons/icon128.png
        echo "✅ 图标文件生成完成"
    else
        echo "❌ 错误: 未找到图标转换工具"
        echo "请安装 ImageMagick 或 librsvg:"
        echo "  macOS: brew install imagemagick 或 brew install librsvg"
        echo "  Ubuntu: sudo apt-get install imagemagick 或 sudo apt-get install librsvg2-bin"
        echo "或者手动将 icons/icon.svg 转换为所需的PNG格式"
        exit 1
    fi
fi

# 验证所有文件
echo "📋 验证项目文件..."
required_files=(
    "manifest.json"
    "src/background.js"
    "src/content.js"
    "src/content.css"
    "src/popup.html"
    "src/popup.css"
    "src/popup.js"
    "src/editor.html"
    "src/editor.css"
    "src/editor.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少文件: $file"
        exit 1
    fi
done

echo "✅ 所有必要文件检查完成"

# 显示安装说明
echo ""
echo "🎉 项目准备完成! 请按以下步骤安装Chrome扩展:"
echo ""
echo "1. 打开Chrome浏览器"
echo "2. 访问: chrome://extensions/"
echo "3. 开启右上角的 '开发者模式'"
echo "4. 点击 '加载已解压的扩展程序'"
echo "5. 选择当前目录: $(pwd)"
echo "6. 完成安装后，访问微信公众号编辑页面开始使用"
echo ""
echo "📖 详细使用说明请查看: README.md"
echo "🔧 安装问题请参考: docs/INSTALL.md"
echo ""
echo "✨ 祝您使用愉快!" 