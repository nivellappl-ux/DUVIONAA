-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Empresas
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  nif TEXT NOT NULL UNIQUE,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  logo_url TEXT,
  moeda TEXT DEFAULT 'AOA',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilizadores ligados a empresas
CREATE TABLE utilizadores (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  perfil TEXT DEFAULT 'operador' CHECK (perfil IN ('admin','gestor','operador','contabilista')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  nome TEXT NOT NULL,
  nif TEXT,
  tipo TEXT DEFAULT 'singular' CHECK (tipo IN ('singular','colectivo')),
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  provincia TEXT,
  limite_credito NUMERIC(15,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  nome TEXT NOT NULL,
  nif TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  pais TEXT DEFAULT 'Angola',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos/Serviços
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT DEFAULT 'produto' CHECK (tipo IN ('produto','servico')),
  preco_venda NUMERIC(15,2) NOT NULL DEFAULT 0,
  preco_custo NUMERIC(15,2) DEFAULT 0,
  taxa_iva NUMERIC(5,2) DEFAULT 14.00,
  unidade TEXT DEFAULT 'UN',
  stock_actual NUMERIC(10,2) DEFAULT 0,
  stock_minimo NUMERIC(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- Faturas
CREATE TABLE faturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  numero TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  cliente_nome TEXT NOT NULL,
  cliente_nif TEXT,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  estado TEXT DEFAULT 'rascunho' CHECK (estado IN ('rascunho','emitida','paga','vencida','anulada')),
  subtotal NUMERIC(15,2) DEFAULT 0,
  total_iva NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  desconto_percent NUMERIC(5,2) DEFAULT 0,
  desconto_valor NUMERIC(15,2) DEFAULT 0,
  notas TEXT,
  moeda TEXT DEFAULT 'AOA',
  cambio_usd NUMERIC(10,4) DEFAULT 1,
  criado_por UUID REFERENCES utilizadores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- Linhas de fatura
CREATE TABLE fatura_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0,
  taxa_iva NUMERIC(5,2) DEFAULT 14.00,
  desconto_percent NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_iva NUMERIC(15,2) NOT NULL DEFAULT 0,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  ordem INTEGER DEFAULT 0
);

-- Pagamentos
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  fatura_id UUID REFERENCES faturas(id),
  valor NUMERIC(15,2) NOT NULL,
  metodo TEXT DEFAULT 'transferencia' CHECK (metodo IN ('dinheiro','transferencia','multicaixa','tpa','cheque','outro')),
  referencia TEXT,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  criado_por UUID REFERENCES utilizadores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funcionários
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  numero TEXT NOT NULL,
  nome TEXT NOT NULL,
  bi TEXT,
  nif TEXT,
  data_nascimento DATE,
  data_admissao DATE NOT NULL,
  data_saida DATE,
  cargo TEXT NOT NULL,
  departamento TEXT,
  salario_base NUMERIC(15,2) NOT NULL DEFAULT 0,
  subsidio_alimentacao NUMERIC(15,2) DEFAULT 0,
  subsidio_transporte NUMERIC(15,2) DEFAULT 0,
  outros_subsidios NUMERIC(15,2) DEFAULT 0,
  tipo_contrato TEXT DEFAULT 'indefinido' CHECK (tipo_contrato IN ('indefinido','prazo_certo','prestacao_servicos','estagio')),
  iban TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- Folha de salários
CREATE TABLE folha_salarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  salario_base NUMERIC(15,2) NOT NULL,
  subsidio_alimentacao NUMERIC(15,2) DEFAULT 0,
  subsidio_transporte NUMERIC(15,2) DEFAULT 0,
  outros_subsidios NUMERIC(15,2) DEFAULT 0,
  horas_extra_valor NUMERIC(15,2) DEFAULT 0,
  faltas_desconto NUMERIC(15,2) DEFAULT 0,
  outros_descontos NUMERIC(15,2) DEFAULT 0,
  inss_trabalhador NUMERIC(15,2) DEFAULT 0,
  inss_patronal NUMERIC(15,2) DEFAULT 0,
  irt NUMERIC(15,2) DEFAULT 0,
  salario_iliquido NUMERIC(15,2) DEFAULT 0,
  salario_liquido NUMERIC(15,2) DEFAULT 0,
  estado TEXT DEFAULT 'calculado' CHECK (estado IN ('calculado','aprovado','pago')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funcionario_id, mes, ano)
);

-- Compras
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  numero TEXT NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id),
  fornecedor_nome TEXT NOT NULL,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'pendente' CHECK (estado IN ('pendente','recebida','parcial','cancelada')),
  subtotal NUMERIC(15,2) DEFAULT 0,
  total_iva NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentos de stock
CREATE TABLE stock_movimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida','ajuste','transferencia')),
  quantidade NUMERIC(10,2) NOT NULL,
  quantidade_anterior NUMERIC(10,2),
  quantidade_nova NUMERIC(10,2),
  referencia_tipo TEXT,
  referencia_id UUID,
  notas TEXT,
  criado_por UUID REFERENCES utilizadores(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
