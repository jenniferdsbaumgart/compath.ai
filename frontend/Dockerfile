FROM node:18-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Expõe a porta padrão do Next.js (dev)
EXPOSE 3000

# Comando para rodar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]
