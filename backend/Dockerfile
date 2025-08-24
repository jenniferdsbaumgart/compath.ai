# Imagem base com Node.js
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante da aplicação
COPY . .

# Expõe a porta padrão do backend
EXPOSE 5000

# Inicia o servidor (ajuste para seu script correto)
CMD ["npm", "run", "dev"]
