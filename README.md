# Quinta Cabacos

<p align="center">
  <img src="public/assets/mainmenu/logo_quinta_cabacos.png" alt="Logo Quinta Cabacos" width="560">
</p>

**Quinta Cabacos** é um jogo 2D em pixel art desenvolvido em **Phaser 3**, **TypeScript** e **Vite**. O projeto simula uma pequena quinta onde o jogador pode explorar o mapa, entrar em edifícios, gerir inventário, comprar sementes e cultivar plantações.

O jogo foi desenvolvido como projeto académico, com foco numa implementação simples, legível e fácil de apresentar.

## Imagens do Projeto

### Mapa Principal

![Mapa principal](public/assets/docs/readme_map_preview.png)

### Interiores dos Edifícios

<table>
  <tr>
    <td align="center">
      <strong>Casa do jogador</strong><br>
      <img src="public/assets/tilemap/house_interior_sem_fundo.png" alt="Interior da casa do jogador" width="260">
    </td>
    <td align="center">
      <strong>Mercado de colheitas</strong><br>
      <img src="public/assets/tilemap/crop_market_sem_fundo.png" alt="Interior do mercado de colheitas" width="260">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Loja de sementes</strong><br>
      <img src="public/assets/tilemap/seed_shop_sunnyside_style_384x288.png" alt="Interior da loja de sementes" width="260">
    </td>
    <td align="center">
      <strong>Câmara municipal</strong><br>
      <img src="public/assets/tilemap/town_hall_sem_fundo.png" alt="Interior da câmara municipal" width="260">
    </td>
  </tr>
</table>

## Como Jogar

O jogador começa no mapa principal da quinta. A partir daí pode deslocar-se pelo mundo, interagir com edifícios e usar ferramentas ou sementes através da hotbar.

Objetivo principal:

- Explorar a quinta.
- Entrar nos edifícios disponíveis.
- Comprar sementes na loja.
- Preparar terreno com a pá.
- Plantar sementes.
- Acompanhar o crescimento das culturas ao longo dos dias.

## Controlos

| Tecla / Ação | Função |
|---|---|
| `W`, `A`, `S`, `D` | Mover o jogador |
| Setas direcionais | Mover o jogador |
| `E` | Interagir / entrar / sair / abrir loja |
| `I` | Abrir ou fechar o inventário |
| `ESC` | Pausar ou continuar o jogo |
| `1` a `8` | Selecionar slot da hotbar |
| Clique esquerdo | Usar item selecionado no terreno |
| Arrastar com o rato | Mover itens entre slots do inventário/hotbar |

## Features

- Menu inicial personalizado com logo e arte própria.
- Sistema de idiomas em português e inglês.
- Mapa principal criado no **Tiled**.
- Colisões configuradas através de layers do Tiled.
- Sistema de interações com objetos do Tiled.
- Entrada e saída de edifícios:
  - Casa do jogador.
  - Mercado de colheitas.
  - Loja de sementes.
  - Câmara municipal.
- Interiores independentes para edifícios.
- Jogador com animações de idle e movimento.
- Inventário com hotbar.
- Arrastar itens entre slots.
- Sistema de dinheiro.
- Loja de sementes com compra de vários tipos de sementes.
- Sistema de tempo com dias e horas.
- Sistema de cultivo:
  - Preparar terreno com a pá.
  - Plantar sementes.
  - Crescimento das culturas ao longo dos dias.
- Assets em pixel art integrados no projeto.

## Tecnologias Utilizadas

- **Phaser 3**: motor principal do jogo.
- **TypeScript**: linguagem usada no desenvolvimento.
- **Vite**: servidor de desenvolvimento e build.
- **Tiled**: criação dos mapas, colisões e interações.
- **HTML/CSS**: estrutura base da página onde o jogo corre.

## Estrutura do Projeto

| Pasta / Ficheiro | Descrição |
|---|---|
| `src/game/main.ts` | Configuração principal do Phaser |
| `src/game/scenes` | Scenes do jogo, menus e interiores |
| `src/game/objects` | Objetos principais, como o jogador |
| `src/game/systems` | Sistemas de gameplay, como cultivo e entradas |
| `src/game/ui` | Interface, inventário, hotbar e painéis |
| `src/game/services` | Serviços de idioma, dinheiro, inventário e tempo |
| `public/assets` | Imagens, sprites, tilesets e assets do jogo |
| `public/assets/mainmenu` | Logo e arte do menu inicial |
| `public/assets/farming` | Indicadores e elementos visuais de cultivo |
| `public/assets/tilemap` | Mapas `.tmj`, tilesets e interiores |
| `public/assets/ui` | Componentes comuns, HUD e elementos das lojas |

## Instalação e Execução

Instalar dependências:

```bash
npm install
```

Executar em modo desenvolvimento:

```bash
npm run dev
```

O jogo fica disponível em:

```text
http://localhost:8080
```

Gerar build de produção:

```bash
npm run build
```

Também existem versões sem envio de logs do template Phaser:

```bash
npm run dev-nolog
npm run build-nolog
```

## Conventional Commits

Neste projeto usamos a convenção **Conventional Commits** para manter o histórico Git mais organizado e fácil de perceber.

Formato recomendado:

```text
tipo: descrição curta da alteração
```

Exemplos:

```text
feat: add seed shop interior
fix: correct crop market image path
docs: update project README
style: adjust main menu logo position
refactor: simplify building entrance system
```

Tipos mais usados:

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações de documentação |
| `style` | Ajustes visuais ou formatação |
| `refactor` | Reorganização de código sem mudar comportamento |
| `chore` | Tarefas auxiliares do projeto |

## Autores

- Miguel Fonseca
- Gonçalo Sousa

## Notas

Este projeto partiu de um template Phaser com Vite e foi adaptado para o jogo **Quinta Cabacos**, incluindo mapas próprios, assets personalizados, interiores, inventário, loja e sistema de cultivo.
