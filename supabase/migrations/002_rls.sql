ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatura_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE folha_salarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movimentos ENABLE ROW LEVEL SECURITY;

-- Função helper para obter empresa do utilizador autenticado
CREATE OR REPLACE FUNCTION get_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM utilizadores WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Políticas RLS para cada tabela (padrão multi-tenant)
CREATE POLICY "tenant_isolation" ON clientes
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON fornecedores
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON produtos
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON faturas
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON pagamentos
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON funcionarios
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON folha_salarios
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON compras
  USING (empresa_id = get_empresa_id());
CREATE POLICY "tenant_isolation" ON stock_movimentos
  USING (empresa_id = get_empresa_id());

-- Fatura itens: acesso via fatura
CREATE POLICY "tenant_isolation" ON fatura_itens
  USING (fatura_id IN (SELECT id FROM faturas WHERE empresa_id = get_empresa_id()));
