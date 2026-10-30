
// =======================================
// 1. CONFIGURAÇÕES E DADOS
// =======================================

"use strict";

const CHAVE = "meu-sorteador-dados-v1";

const $ = (id) => document.getElementById(id);

const exemplo = [
  {
    id: "exemplo-1",
    nome: "Características",
    itens: [
      "Elegante",
      "Misteriosa",
      "Gentil",
      "Corajosa",
      "Criativa"
    ]
  },
  {
    id: "exemplo-2",
    nome: "Tesouros",
    itens: [
      "Espada",
      "Poção",
      "Escudo",
      "Anel mágico"
    ]
  }
];

// Confere se os dados importados são válidos.
function dadosValidos(dados) {
  return (
    Array.isArray(dados) &&
    dados.length <= 10000 &&
    dados.every((s) =>
      s &&
      typeof s.id === "string" &&
      typeof s.nome === "string" &&
      s.nome.length <= 100 &&
      Array.isArray(s.itens) &&
      s.itens.length <= 100000 &&
      s.itens.every((item) =>
        typeof item === "string" &&
        item.length <= 200
      )
    ) &&
    new Set(dados.map(s => s.id)).size === dados.length
  );
}

// Carrega as listas salvas.
function carregarDados() {
  try {
    const salvos = localStorage.getItem(CHAVE);

    if (salvos !== null) {
      const dados = JSON.parse(salvos);

      if (dadosValidos(dados)) {
        return dados;
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar:", erro);
  }

  return JSON.parse(JSON.stringify(exemplo));
}

let sorteios = carregarDados();

let sorteioEditando = sorteios[0]?.id ?? null;

let executando = false;
let temporizador = null;
let intervaloAnimacao = null;

// =======================================
// 2. FUNÇÕES AUXILIARES
// =======================================

function salvar() {
  try {
    localStorage.setItem(
      CHAVE,
      JSON.stringify(sorteios)
    );
  } catch (erro) {
    console.error(erro);

    alert(
      "Não foi possível salvar os dados. " +
      "Verifique o armazenamento do navegador."
    );
  }
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

function atualizarIcones() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function sorteioAtual() {
  return sorteios.find(
    s => s.id === sorteioEditando
  );
}

function atualizarTudo() {
  atualizarBiblioteca();
  atualizarSeletor();
  atualizarIcones();
}

// =======================================
// 3. TROCAR ENTRE AS DUAS ÁREAS
// =======================================

function abrirTela(nome) {
  if (executando) {
    return;
  }

  const criando = nome === "criar";

  $("tela-criar").classList.toggle(
    "escondido", !criando
  );

  $("tela-sortear").classList.toggle(
    "escondido", criando
  );

  $("aba-criar").classList.toggle(
    "ativa", criando
  );

  $("aba-sortear").classList.toggle(
    "ativa", !criando
  );

  if (!criando) {
    atualizarSeletor();
  }
}

$("aba-criar").addEventListener(
  "click",
  () => abrirTela("criar")
);

$("aba-sortear").addEventListener(
  "click",
  () => abrirTela("sortear")
);

// =======================================
// 4. CRIAR NOVOS SORTEIOS
// =======================================

function criarSorteio() {
  const nome = $("novo-sorteio").value.trim();

  if (!nome) {
    alert("Digite um nome para o sorteio.");
    return;
  }

  const novo = {
    id: crypto.randomUUID(),
    nome: nome,
    itens: []
  };

  sorteios.push(novo);

  sorteioEditando = novo.id;

  $("novo-sorteio").value = "";

  salvar();
  atualizarTudo();
}

$("btn-criar").addEventListener(
  "click", criarSorteio
);

$("novo-sorteio").addEventListener(
  "keydown",
  (evento) => {
    if (evento.key === "Enter") {
      criarSorteio();
    }
  }
);

// =======================================
// 5. MOSTRAR A BIBLIOTECA
// =======================================

function atualizarBiblioteca() {
  const area = $("lista-sorteios");

  area.replaceChildren();

  sorteios.forEach((sorteio) => {
    const linha = criarElemento(
      "div",
      "sorteio-linha"
    );

    if (sorteio.id === sorteioEditando) {
      linha.classList.add("selecionado");
    }

    const escolher = criarElemento(
      "button",
      "sorteio-escolher",
      sorteio.nome || "(Sem nome)"
    );

    escolher.type = "button";

    const contador = criarElemento(
      "small",
      "",
      sorteio.itens.length + " itens"
    );

    escolher.appendChild(contador);

    escolher.addEventListener(
      "click",
      () => {
        sorteioEditando = sorteio.id;
        atualizarBiblioteca();
      }
    );

    // Botão para duplicar o sorteio.
    const duplicar = criarElemento(
      "button",
      "botao-icone",
      "⧉"
    );

    duplicar.type = "button";
    duplicar.title = "Duplicar sorteio";

    duplicar.addEventListener(
      "click",
      () => {
        const copia = {
          id: crypto.randomUUID(),
          nome: sorteio.nome + " (cópia)",
          itens: [...sorteio.itens]
        };

        sorteios.push(copia);
        sorteioEditando = copia.id;

        salvar();
        atualizarTudo();
      }
    );

    linha.append(escolher, duplicar);
    area.appendChild(linha);
  });

  atualizarEditor();
}

// =======================================
// 6. EDITAR SORTEIOS E ITENS
// =======================================

function atualizarEditor() {
  const sorteio = sorteioAtual();

  $("editor").classList.toggle(
    "escondido",
    !sorteio
  );

  if (!sorteio) {
    return;
  }

  $("nome-edicao").value = sorteio.nome;

  $("contador-itens").textContent =
    sorteio.itens.length + " itens";

  const area = $("lista-itens");

  area.replaceChildren();

  sorteio.itens.forEach((item, indice) => {
    const linha = criarElemento(
      "div",
      "item-linha"
    );

    const campo = criarElemento("input");

    campo.value = item;
    campo.maxLength = 200;
    campo.setAttribute(
      "aria-label",
      "Item " + (indice + 1)
    );

    // Salva a edição do item.
    campo.addEventListener(
      "change",
      () => {
        const nome = campo.value.trim();

        if (!nome) {
          campo.value = sorteio.itens[indice];
          return;
        }

        sorteio.itens[indice] = nome;

        salvar();
      }
    );

    // Botão para excluir o item.
    const excluir = criarElemento(
      "button",
      "botao-icone",
      "✕"
    );

    excluir.type = "button";
    excluir.title = "Excluir item";

    excluir.addEventListener(
      "click",
      () => {
        sorteio.itens.splice(indice, 1);

        salvar();
        atualizarTudo();
      }
    );

    linha.append(campo, excluir);
    area.appendChild(linha);
  });
}

// Renomear o sorteio.
$("nome-edicao").addEventListener(
  "change",
  () => {
    const sorteio = sorteioAtual();

    if (!sorteio) return;

    const nome = $("nome-edicao").value.trim();

    if (!nome) {
      $("nome-edicao").value = sorteio.nome;
      return;
    }

    sorteio.nome = nome;

    salvar();
    atualizarTudo();
  }
);

// Adicionar um item.
function adicionarItem() {
  const sorteio = sorteioAtual();

  if (!sorteio) return;

  const nome = $("novo-item").value.trim();

  if (!nome) {
    alert("Digite o nome do item.");
    return;
  }

  sorteio.itens.push(nome);

  $("novo-item").value = "";

  salvar();
  atualizarTudo();

  $("novo-item").focus();
}

$("btn-adicionar-item").addEventListener(
  "click", adicionarItem
);

$("novo-item").addEventListener(
  "keydown",
  (evento) => {
    if (evento.key === "Enter") {
      adicionarItem();
    }
  }
);

// Excluir um sorteio inteiro.
$("btn-excluir-sorteio").addEventListener(
  "click",
  () => {
    const sorteio = sorteioAtual();

    if (!sorteio) return;

    const confirmar = confirm(
      'Excluir o sorteio "' +
      sorteio.nome +
      '" e todos os seus itens?'
    );

    if (!confirmar) return;

    sorteios = sorteios.filter(
      s => s.id !== sorteio.id
    );

    sorteioEditando =
      sorteios[0]?.id ?? null;

    salvar();
    atualizarTudo();
  }
);

// =======================================
// 7. EXPORTAR E IMPORTAR
// =======================================

$("btn-exportar").addEventListener(
  "click",
  () => {
    const conteudo = JSON.stringify(
      sorteios,
      null,
      2
    );

    const arquivo = new Blob(
      [conteudo],
      { type: "application/json" }
    );

    const endereco = URL.createObjectURL(arquivo);

    const link = document.createElement("a");

    link.href = endereco;
    link.download = "meus-sorteios.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(
      () => URL.revokeObjectURL(endereco),
      1000
    );
  }
);

$("btn-importar").addEventListener(
  "click",
  () => {
    $("arquivo-importacao").click();
  }
);

$("arquivo-importacao").addEventListener(
  "change",
  async (evento) => {
    const arquivo = evento.target.files[0];

    if (!arquivo) return;

    try {
      const texto = await arquivo.text();

      const dados = JSON.parse(texto);

      if (!dadosValidos(dados)) {
        throw new Error("Formato inválido");
      }

      const confirmar = confirm(
        "A importação substituirá todas as " +
        "listas atuais. Deseja continuar?"
      );

      if (!confirmar) return;

      sorteios = dados;

      sorteioEditando =
        sorteios[0]?.id ?? null;

      salvar();
      atualizarTudo();

      alert("Listas importadas com sucesso!");
    } catch (erro) {
      alert(
        "Não foi possível importar o arquivo."
      );
    } finally {
      evento.target.value = "";
    }
  }
);

// =======================================
// 8. SELECIONAR O SORTEIO
// =======================================

function atualizarSeletor() {
  const seletor = $("seletor-sorteio");

  const anterior = seletor.value;

  seletor.replaceChildren();

  sorteios.forEach((sorteio) => {
    const opcao = document.createElement("option");

    opcao.value = sorteio.id;
    opcao.textContent = sorteio.nome;

    seletor.appendChild(opcao);
  });

  if (sorteios.some(s => s.id === anterior)) {
    seletor.value = anterior;
  }

  atualizarTituloSorteio();
}

function atualizarTituloSorteio() {
  const id = $("seletor-sorteio").value;

  const sorteio = sorteios.find(
    s => s.id === id
  );

  $("titulo-sorteio").textContent =
    sorteio?.nome ?? "Nenhum sorteio";
}

$("seletor-sorteio").addEventListener(
  "change",
  () => {
    atualizarTituloSorteio();
    limparResultados();
  }
);

// =======================================
// 9. QUANTIDADE E TEMPO
// =======================================

function configuracao() {
  const quantidade = Number(
    $("quantidade").value
  );

  const tempo = Number(
    $("tempo").value
  );

  return {
    quantidade,
    tempo,
    repetir: $("permitir-repetir").checked
  };
}

function atualizarTempoTotal() {
  const { quantidade, tempo } = configuracao();

  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    !Number.isInteger(tempo) ||
    tempo < 1
  ) {
    $("tempo-total").textContent =
      "Digite valores válidos.";
    return;
  }

  const total = quantidade * tempo;

  const minutos = Math.floor(total / 60);
  const segundos = total % 60;

  $("tempo-total").textContent =
    "Tempo de animação: " +
    minutos + " min " +
    segundos + " s";
}

$("quantidade").addEventListener(
  "input", atualizarTempoTotal
);

$("tempo").addEventListener(
  "input", atualizarTempoTotal
);

// =======================================
// 10. PREPARAR OS RESULTADOS
// =======================================

function limparResultados() {
  $("resultados").replaceChildren();

  $("nome-piscando").textContent = "✧";

  $("nome-piscando").classList.remove(
    "piscando"
  );

  $("estado-sorteio").textContent =
    "Aguardando sorteio";

  $("progresso").textContent =
    "0 de 0 resultados";
}

function criarEspacos(quantidade) {
  const area = $("resultados");

  area.replaceChildren();

  for (let i = 0; i < quantidade; i++) {
    const espaco = criarElemento(
      "div",
      "resultado-item pendente",
      (i + 1) + ". Aguardando..."
    );

    area.appendChild(espaco);
  }

  $("progresso").textContent =
    "0 de " + quantidade + " resultados";
}

// =======================================
// 11. SORTEIO ALEATÓRIO
// =======================================

function indiceAleatorio(maximo) {
  if (maximo <= 0) {
    throw new Error("Lista vazia");
  }

  const limite = Math.floor(
    4294967296 / maximo
  ) * maximo;

  const numero = new Uint32Array(1);

  do {
    crypto.getRandomValues(numero);
  } while (numero[0] >= limite);

  return numero[0] % maximo;
}

function escolherAleatorio(lista) {
  return lista[indiceAleatorio(lista.length)];
}

// =======================================
// 12. ANIMAÇÃO DOS NOMES
// =======================================

function esperar(milissegundos) {
  return new Promise((resolver) => {
    temporizador = setTimeout(
      () => {
        temporizador = null;
        resolver();
      },
      milissegundos
    );
  });
}

function iniciarAnimacao(itens) {
  const nome = $("nome-piscando");

  nome.classList.add("piscando");

  intervaloAnimacao = setInterval(
    () => {
      nome.textContent = escolherAleatorio(itens);
    },
    85
  );
}

function pararAnimacao() {
  clearInterval(intervaloAnimacao);

  intervaloAnimacao = null;

  $("nome-piscando").classList.remove(
    "piscando"
  );
}

// =======================================
// 13. EXECUTAR O SORTEIO
// =======================================

async function iniciarSorteio() {
  if (executando) return;

  const id = $("seletor-sorteio").value;

  const sorteio = sorteios.find(
    s => s.id === id
  );

  if (!sorteio || sorteio.itens.length === 0) {
    alert(
      "Escolha um sorteio que tenha itens."
    );
    return;
  }

  const { quantidade, tempo, repetir } =
    configuracao();

  if (
    !Number.isInteger(quantidade) ||
    quantidade < 1 ||
    quantidade > 1000
  ) {
    alert(
      "Escolha de 1 a 1000 resultados."
    );
    return;
  }

  if (
    !Number.isInteger(tempo) ||
    tempo < 1 ||
    tempo > 60
  ) {
    alert(
      "Escolha de 1 a 60 segundos."
    );
    return;
  }

  if (
    !repetir &&
    quantidade > sorteio.itens.length
  ) {
    alert(
      "Sem repetições, a quantidade não pode " +
      "ser maior que o número de itens."
    );
    return;
  }

  executando = true;

  $("btn-iniciar").disabled = true;

  $("btn-cancelar").classList.remove(
    "escondido"
  );

  $("seletor-sorteio").disabled = true;
  $("quantidade").disabled = true;
  $("tempo").disabled = true;
  $("permitir-repetir").disabled = true;

  criarEspacos(quantidade);

  const disponiveis = [...sorteio.itens];

  let concluidos = 0;
  let cancelado = false;

  // Permite interromper entre animações.
  $("btn-cancelar").onclick = () => {
    cancelado = true;
  };

  try {
    for (let i = 0; i < quantidade; i++) {
      if (cancelado) break;

      $("estado-sorteio").textContent =
        "Sorteando " +
        (i + 1) + " de " + quantidade;

      iniciarAnimacao(sorteio.itens);

      // Tempo configurado para CADA resultado.
      const inicio = performance.now();

      while (
        performance.now() - inicio < tempo * 1000
      ) {
        await esperar(50);

        if (cancelado) break;
      }

      pararAnimacao();

      if (cancelado) break;

      let escolhido;

      if (repetir) {
        escolhido = escolherAleatorio(
          sorteio.itens
        );
      } else {
        const indice = indiceAleatorio(
          disponiveis.length
        );

        escolhido = disponiveis.splice(
          indice, 1
        )[0];
      }

      $("nome-piscando").textContent =
        escolhido;

      const espaco =
        $("resultados").children[i];

      espaco.textContent =
        (i + 1) + ". " + escolhido;

      espaco.classList.remove("pendente");
      espaco.classList.add("revelado");

      concluidos++;

      $("progresso").textContent =
        concluidos + " de " +
        quantidade + " resultados";

      // Pequena pausa entre revelações.
      if (i < quantidade - 1) {
        await esperar(350);
      }
    }

    $("estado-sorteio").textContent =
      cancelado
        ? "Sorteio interrompido"
        : "Sorteio concluído!";
  } finally {
    pararAnimacao();

    executando = false;

    $("btn-iniciar").disabled = false;

    $("btn-cancelar").classList.add(
      "escondido"
    );

    $("seletor-sorteio").disabled = false;
    $("quantidade").disabled = false;
    $("tempo").disabled = false;
    $("permitir-repetir").disabled = false;
  }
}

$("btn-iniciar").addEventListener(
  "click", iniciarSorteio
);

// =======================================
// 14. INICIALIZAR O APLICATIVO
// =======================================

atualizarTudo();
atualizarTempoTotal();
limparResultados();

// Os ícones podem carregar depois do JS.
window.addEventListener(
  "load",
  atualizarIcones
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => {
        console.log("Modo offline registrado.");
      })
      .catch((erro) => {
        console.error(
          "Erro ao registrar modo offline:",
          erro
        );
      });
  });
}
