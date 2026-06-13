# Urban Data Hub

Plataforma web para registro, armazenamento, consulta e acompanhamento de ocorrências urbanas reportadas pela população.

**Projeto integrador acadêmico — Ciência de Dados / UNISO**  
Equipe: Luis Felipe Ferreira Lopes e Jonathas Buzzetti Villalba  
ODS: 9 (Inovação), 11 (Cidades Sustentáveis), 16 (Transparência)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | Tailwind CSS v3 |
| Backend | Node.js + Express + TypeScript |
| Banco | MongoDB (Mongoose) |
| Upload | Multer |
| HTTP Client | Axios |
| Validação | Zod |

---

## Pré-requisitos

- Node.js >= 18
- MongoDB rodando localmente (porta 27017)

---

## Instalação e execução

```bash
# 1. Instalar dependências do backend
cd backend
npm install

# 2. Instalar dependências do frontend
cd ../frontend
npm install

# 3. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Edite MONGODB_URI se necessário

# 4. Popular banco com dados de exemplo (opcional)
cd backend
npm run seed

# 5. Iniciar backend (porta 3001)
cd backend
npm run dev

# 6. Iniciar frontend (em outro terminal — porta 5173)
cd frontend
npm run dev
```

Acesse: http://localhost:5173

---

## Funcionalidades

- **Listagem** de ocorrências com filtros por categoria, bairro e status
- **Registro** de nova ocorrência com upload de imagem opcional
- **Detalhes** da ocorrência com histórico de status em linha do tempo
- **Atualização de status** com campo de observação
- **Dashboard** com estatísticas, gráficos de barra/pizza e ranking de bairros

---

## Categorias

| Código | Label |
|---|---|
| `buraco_via` | Buraco na Via |
| `iluminacao` | Iluminação Pública |
| `descarte_residuos` | Descarte Irregular de Resíduos |
| `calcada_danificada` | Calçada Danificada |
| `alagamento` | Alagamento |
| `sinalizacao` | Sinalização |
| `outros` | Outros |

---

## API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/occurrences` | Lista todas (query: `category`, `neighborhood`, `status`) |
| GET | `/api/occurrences/stats` | Estatísticas para o dashboard |
| GET | `/api/occurrences/:id` | Detalhes de uma ocorrência |
| POST | `/api/occurrences` | Cria nova ocorrência (multipart/form-data) |
| PATCH | `/api/occurrences/:id/status` | Atualiza status com histórico |
