backend: express, prisma, postgreSQL.
frontend: next.js / react native

backend/
├── prisma/
│   ├── schema.prisma         
│   └── migrations/           
│
├── src/
│   ├── config/
│   │   ├── db.ts           // config do projeto (variáveis, conexões)
│   │   ├── env.ts         
|   |   └── stripe.ts       // config da stripe (inicialização e exportação da instância)
│   │
│   ├── controllers/         
│   │   ├── userController.ts
│   │   ├── eventController.ts
│   │   ├── ticketController.ts
│   │   └── paymentController.ts  // processa pagamentos da Stripe
│   │
│   ├── middlewares/          
│   │   └── authMiddleware.ts
│   │
│   ├── routes/                // Definição das rotas da API, organizadas por recurso
│   │   ├── userRoutes.ts
│   │   ├── eventRoutes.ts
│   │   ├── ticketRoutes.ts
│   │   └── paymentRoutes.ts   // Rotas para pagamentos, integrando a Stripe
│   │
│   ├── services/              // Lógica de negócio e acesso a dados (integração com Prisma e Stripe)
│   │   ├── userService.ts
│   │   ├── eventService.ts
│   │   ├── ticketService.ts
│   │   └── paymentService.ts  // Serviço que interage com a Stripe e o banco para pagamentos
│   │
│   ├── utils/                 // Funções utilitárias e helpers
│   │   └── helpers.ts
│   │
│   ├── app.ts                 // Configuração do app Express (middlewares, rotas etc.)
│   └── index.ts               // Ponto de entrada do servidor
│
├── tests/                     // Testes (unitários, integração, etc.)
│   └── ...                    // Arquivos de teste
│
├── .env                       // Variáveis de ambiente (incluindo STRIPE_SECRET_KEY, DATABASE_URL, etc.)
├── package.json
├── README.md
└── .gitignore


models: 

User
id: String (PK)
email: String (único)
password: String
type: String ("owner" ou "user")
phone: String (opcional)
name: String
imgUrl: String (opcional)

Event
id: String (PK)
name: String
description: String
place: String
price: Float
quantity: Int (quantidade total de ingressos)
ownerId: String (referência ao id do usuário que criou o evento)
imgUrl: String

Ticket
id: String (PK)
eventId: String (referência ao id do evento)
userId: String (referência ao id do usuário que possui o ticket)
paymentId: String (referência ao id do pagamento)
status: String (ex.: "active" ou "inactive")

Payment
id: String (PK)
userId: String (referência ao id do usuário que efetuou o pagamento)
eventId: String (referência ao id do evento)
price: Float (valor pago)
date: DateTime (data/hora do pagamento, com valor padrão now())
method: String (método de pagamento)
Relações entre os Modelos
User & Event

Relação: Um User pode criar vários Event (campo events no User).
Detalhe: Cada Event tem um único User como dono (campo owner em Event, com a chave estrangeira ownerId).
User & Ticket

Relação: Um User pode possuir vários Ticket (campo tickets no User).
Detalhe: Cada Ticket está associado a um único User (campo user em Ticket, com a chave estrangeira userId).
User & Payment

Relação: Um User pode realizar vários Payment (campo payments no User).
Detalhe: Cada Payment pertence a um único User (campo user em Payment, com a chave estrangeira userId).
Event & Ticket

Relação: Um Event pode ter vários Ticket (campo tickets em Event).
Detalhe: Cada Ticket pertence a um único Event (campo event em Ticket, com a chave estrangeira eventId).
Event & Payment

Relação: Um Event pode ter vários Payment (campo payments em Event).
Detalhe: Cada Payment está relacionado a um único Event (campo event em Payment, com a chave estrangeira eventId).
Payment & Ticket

Relação: Um Payment pode estar associado a vários Ticket (campo tickets em Payment).
Detalhe: Cada Ticket está vinculado a um único Payment (campo payment em Ticket, com a chave estrangeira paymentId).
