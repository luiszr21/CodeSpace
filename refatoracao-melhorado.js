// dashboard.js – Módulo de Métricas de Vendas (REFATORADO)

const CONFIG = {
  BASE_URL: 'https://api.empresa.com',
  TAXA_IMPOSTO: 0.15,
  LIMITE_ALERTA: 100
};

// ✅ MELHORIA 1: Usar async/await em vez de callbacks
// ✅ MELHORIA 2: Usar template literals em vez de concatenação
// ✅ MELHORIA 3: Usar const em vez de var
// ✅ MELHORIA 4: Usar === em vez de ==
// ✅ MELHORIA 5: Usar filter() e reduce() em vez de loops
async function carregarDashboard(periodo) {
  // ✅ MELHORIA 6: Validação de entrada
  if (!periodo || typeof periodo !== 'string') {
    throw new Error('Período inválido');
  }

  try {
    const url = `${CONFIG.BASE_URL}/metricas?periodo=${encodeURIComponent(periodo)}`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();

    // Validar estrutura de dados
    if (!Array.isArray(dados?.vendas)) {
      throw new Error('Formato de dados inválido');
    }

    // ✅ MELHORIA 7: filter() em vez de loop manual
    const vendasAprovadas = dados.vendas.filter(venda => venda.status === 'aprovada');

    // ✅ MELHORIA 8: reduce() em vez de loop para soma
    const total = vendasAprovadas.reduce((soma, venda) => soma + (venda.valor ?? 0), 0);

    return {
      total,
      quantidade: vendasAprovadas.length,
      itens: vendasAprovadas,
      totalComImposto: total * (1 + CONFIG.TAXA_IMPOSTO)
    };
  } catch (erro) {
    console.error('Erro ao carregar dashboard:', erro.message);
    throw erro;
  }
}

// ✅ MELHORIA 9: Template literals e separação de HTML
// ✅ MELHORIA 10: Nomes de variáveis descritivos
function formatarRelatorio(dados) {
  const validarDados = (dados) => {
    return dados && typeof dados.total === 'number' && typeof dados.quantidade === 'number';
  };

  if (!validarDados(dados)) {
    throw new Error('Dados inválidos para relatório');
  }

  return `
    <h2>Relatório de Vendas</h2>
    <p>Total: R$ ${dados.total.toFixed(2)}</p>
    <p>Com impostos: R$ ${dados.totalComImposto.toFixed(2)}</p>
    <p>Quantidade: ${dados.quantidade}</p>
  `;
}

// ✅ MELHORIA 11: Simplificar lógica usando Object.entries() e métodos modernos
// ✅ MELHORIA 12: Eliminar loops repetitivos
function classificarVendedores(vendedores) {
  return (
    Object.entries(vendedores)
      .map(([nome, dados]) => ({
        nome,
        total: dados.total,
        ativo: dados.ativo
      }))
      .filter(vendedor => {
        if (!vendedor.ativo) {
          console.warn(`Vendedor inativo: ${vendedor.nome}`);
        }
        return vendedor.ativo;
      })
      .sort((a, b) => b.total - a.total) // ✅ Comparador mais simples
  );
}

// ✅ MELHORIA 13: Usar reduce() e métodos modernos
// ✅ MELHORIA 14: Melhor formatação de data
function verificarAlertas(metricas, meta) {
  // Validação
  if (!metricas || !metricas.itens || typeof meta !== 'number' || meta <= 0) {
    throw new Error('Dados ou meta inválidos');
  }

  // ✅ Filtrar items com valor > 0
  const itensValidos = metricas.itens.filter(item => item.valor > 0);

  const percentual = (metricas.total / meta) * 100;

  const alertas = [];

  // Alerta de meta
  if (percentual < CONFIG.LIMITE_ALERTA) {
    alertas.push({
      tipo: 'perigo',
      msg: `Meta em ${percentual.toFixed(1)}% – abaixo do limite de ${CONFIG.LIMITE_ALERTA}%`
    });
  } else {
    alertas.push({
      tipo: 'sucesso',
      msg: `Meta atingida: ${percentual.toFixed(1)}%`
    });
  }

  // Data formatada corretamente
  const dataAtualizada = new Date().toLocaleString('pt-BR');
  alertas.push({
    tipo: 'info',
    msg: `Atualizado em: ${dataAtualizada}`
  });

  return alertas;
}

// ✅ EXEMPLO DE USO MODERNO (com async/await)
async function executarDashboard() {
  try {
    const resultado = await carregarDashboard('2024-01');
    console.log('Resultado:', resultado);
    console.log('HTML:', formatarRelatorio(resultado));
  } catch (erro) {
    console.error('Erro:', erro);
  }
}
