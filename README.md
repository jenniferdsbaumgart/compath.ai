# Compath

Compath é uma plataforma projetada para ajudar empreendedores a encontrar o nicho ideal, explorar concorrentes e analisar potenciais clientes com base em regiões geográficas. A plataforma também inclui um sistema gamificado de moedas, onde os usuários podem ganhar e gastar moedas ao realizar pesquisas e acessar cursos valiosos.

---

## Visão Geral do Projeto

Compath é uma aplicação web que ajuda empreendedores iniciantes e atuais a encontrar as melhores oportunidades de mercado com base em pesquisas alimentadas por IA. A plataforma permite que os usuários realizem pesquisas sobre nichos, concorrentes e dados demográficos de clientes por região. Além disso, a plataforma possui um sistema único de moedas para incentivar o engajamento e a exploração.

---

## Funcionalidades

- **Pesquisa de Mercado com IA:** Relatórios detalhados sobre oportunidades de negócios, análise de clientes e concorrentes por região.
- **Sistema de Moeda do Usuário:** Experiência gamificada onde os usuários ganham moedas ao utilizar a plataforma e convidar outras pessoas. As moedas são usadas para realizar pesquisas.
- **Cursos:** Acesso a cursos voltados para o aprimoramento das habilidades empreendedoras.
- **Dashboard:** Exibe pesquisas anteriores, insights e dados importantes através de gráficos interativos.

---

## Instalação

Para começar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

Certifique-se de que você tenha os seguintes programas instalados em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 16 ou superior)
- [Git](https://git-scm.com/)

### Passos para Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/compath.git
   ```

2. Instale as dependências para o frontend e backend:

```bash
# Para o front-end
cd frontend
npm install

# Para o back-end
cd ../backend
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo .env e adicione suas variáveis de ambiente, como chaves de API, strings de conexão com banco de dados, etc.

4. Execute o servidor de desenvolvimento:

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev

```

5. Abra a aplicação no seu navegador em http://localhost:3000.

## Uso

- **Cadastro**: Os usuários podem criar uma conta para começar a usar a plataforma.
- **Consultas de Pesquisa**: Após o login, os usuários podem buscar dados de mercado e insights com a ferramenta de pesquisa alimentada por IA.
- **Dashboard**: Visualize pesquisas anteriores e insights em um painel interativo.
- **Moedas**: Acompanhe as moedas usadas e ganhas ao realizar pesquisas.
- **Cursos**: Navegue pelos cursos disponíveis e faça matrícula para melhorar suas habilidades empreendedoras.

---

## Tecnologias Utilizadas

### Frontend:
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend:
- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

### Outros:
- [JWT](https://jwt.io/) (para autenticação)

## Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
