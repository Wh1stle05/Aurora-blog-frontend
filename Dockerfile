# 选择 Node 官方镜像
FROM node:22.19.0

# 设置工作目录
WORKDIR /app

# 先复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目源码
COPY . .

# 暴露端口（开发环境常见3000）
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev"]
