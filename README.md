# Quinta Cabaços

<p align="center">
  <img src="public/assets/mainmenu/logo_quinta_cabacos.png" alt="Logo Quinta Cabaços" width="560">
</p>

**Quinta Cabaços** é um jogo 2D top-down em pixel art desenvolvido em **Phaser 3**, **TypeScript** e **Vite**. O jogador gere uma pequena quinta, compra sementes e ferramentas, cultiva plantas, vende colheitas, compra novos terrenos e completa quests para ganhar dinheiro.

## Grupo

| Elemento | Número de aluno | GitHub |
|---|---|---|
| Cristiano Fonseca | 29725  | [m1guelfonseca](https://github.com/m1guelfonseca) |
| Gonçalo Sousa | 29726 | [goncalojbsousa](https://github.com/goncalojbsousa) |

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **Phaser 3.90.0** | Motor 2D do jogo, incluído via npm |
| **TypeScript** | Código principal do jogo, com tipagem para facilitar manutenção |
| **Vite 6.3.1** | Servidor local e build do projeto |
| **Tiled** | Criação do mapa principal, interiores, colisões e zonas de interação |
| **HTML/CSS** | Estrutura base da página onde o jogo corre |

## Descrição do Jogo

O jogo segue uma lógica de **farm simulator** em 2D. O objetivo é evoluir a quinta através de ciclos de cultivo e economia:

- comprar sementes na loja;
- preparar terreno com a enxada;
- plantar e regar culturas;
- esperar pelo crescimento ao longo dos dias;
- colher e vender no mercado;
- comprar ferramentas e novos terrenos;
- ativar e completar quests no Crop Market.

O estado do jogo é apresentado no HUD: dinheiro, dia/hora, energia, água do regador, inventário/hotbar e quest ativa.

## Regras e Sistemas Implementados

### Cultivo

- O jogador só pode plantar em terreno preparado.
- A enxada prepara o solo.
- As sementes ocupam slots do inventário/hotbar.
- As plantas precisam de água para crescer.
- Cada cultura tem tempos de crescimento próprios.
- Quando a cultura está pronta, aparece um indicador visual e pode ser colhida com a foice.

### Energia, tempo e desmaio

- Usar ferramentas, plantar, colher e regar consome energia.
- O dia avança com o tempo de jogo.
- Se o jogador ficar ativo até às 02:00, desmaia.
- Ao desmaiar, perde parte do dinheiro, recupera energia parcialmente e volta para a quinta de manhã.
- Dormir em casa avança para o dia seguinte e recupera energia.

### Economia

- O jogador começa com dinheiro inicial.
- Sementes e ferramentas podem ser compradas nas lojas.
- Colheitas podem ser vendidas no Crop Market.
- Terrenos extra podem ser comprados na câmara municipal.

### Quests

As quests são ativadas na tab **Quests** do Crop Market. Apenas uma quest pode estar ativa de cada vez.

Quests atuais:

| Quest | Objetivo | Recompensa |
|---|---|---|
| Plantar Abóboras | Plantar 3 abóboras | 75 $ |
| Vender Cenouras | Vender 3 cenouras no Crop Market | 60 $ |
| Regar Plantas | Regar qualquer tipo de planta 10 vezes | 50 $ |

Quando uma quest fica completa, o jogador deve voltar ao Crop Market e clicar em **Concluir** para receber a recompensa.

### Inventário e save

- Hotbar com 8 slots.
- Inventário extra com drag and drop entre slots.
- Sistema de save em 3 slots.
- O save guarda inventário, dinheiro, tempo, energia, água do regador, terrenos comprados, plantas/solo e progresso das quests.

## Controlos

| Tecla / Ação | Função |
|---|---|
| `W`, `A`, `S`, `D` | Mover o jogador |
| Setas direcionais | Mover o jogador |
| `E` | Interagir com edifícios, lojas, cama, mercado, poço e saídas |
| `I` | Abrir ou fechar o inventário |
| `ESC` | Abrir menu de pausa ou fechar painéis |
| `1` a `8` | Selecionar slot da hotbar |
| Clique esquerdo | Usar item selecionado no terreno |
| Arrastar com o rato | Mover itens entre inventário e hotbar |

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

## Aspetos Multimédia

O projeto usa recursos multimédia adequados ao estilo pixel art e ao carregamento no browser:

| Tipo | Formato | Uso |
|---|---|---|
| Imagens | `.png` | Tilesets, interiores, UI, logo, ferramentas, culturas e jogador |
| Mapas | `.tmj` | Mapas criados/editados no Tiled |
| Sons | `.mp3` | Efeitos de interação, compra, venda, ferramentas, rega, sono e feedback de erro |
| Spritesheets | `.png` | Animações do jogador, ferramentas/culturas por frames e barra de energia |

Resumo dos assets em `public/assets`:

- 47 ficheiros `.png`, cerca de 5.53 MB.
- 17 ficheiros `.mp3`, cerca de 0.31 MB.
- 6 ficheiros `.tmj`, cerca de 0.37 MB.
- Total aproximado: 6.21 MB.

Os mapas e interiores foram compostos no Tiled a partir dos tilesets incluídos no projeto. Os sprites e elementos de UI foram integrados em tamanhos proporcionais ao uso no jogo, evitando imagens demasiado grandes para elementos pequenos. Os sons estão em MP3 comprimido, em ficheiros curtos, para manter o carregamento leve.

## Suporte Multilingue

O jogo suporta **português** e **inglês**. O idioma pode ser alterado nas definições.

A estrutura de tradução está centralizada em:

```text
src/game/services/LanguageService.ts
```

Isto evita strings duplicadas espalhadas pelo código e permite traduzir menus, HUD, lojas, quests, itens e mensagens de feedback.

## Estrutura do Projeto

| Pasta / Ficheiro | Descrição |
|---|---|
| `index.html` | Página base onde o jogo é montado |
| `src/main.ts` | Entrada da aplicação |
| `src/game/main.ts` | Configuração principal do Phaser e registo das scenes |
| `src/game/scenes` | Menus, jogo principal, interiores, lojas e pausa |
| `src/game/world` | Criação do mapa principal e câmara |
| `src/game/objects` | Objetos principais, como o jogador |
| `src/game/systems` | Sistemas de gameplay: cultivo, entradas, regador |
| `src/game/services` | Estado e serviços: dinheiro, inventário, tempo, saves, quests, idioma |
| `src/game/ui` | HUD, inventário, lojas, painéis e displays |
| `src/game/data` | Dados dos itens, sementes, ferramentas e culturas |
| `public/assets` | Imagens, áudio, tilesets, tilemaps e UI |
| `docs` | Documentação auxiliar |

## Jogar Online

O jogo está publicado no GitHub Pages e pode ser jogado no browser:

```text
https://goncalojbsousa.github.io/Farming-Simulator-Cabacos/
```

## Como Executar

Instalar dependências:

```bash
npm install
```

Executar em modo desenvolvimento:

```bash
npm run dev
```

Ou sem logs do template Phaser:

```bash
npm run dev-nolog
```

O jogo fica disponível em:

```text
http://localhost:8080
```

Gerar build de produção:

```bash
npm run build
```

Build sem logs do template:

```bash
npm run build-nolog
```

## Checklist do Enunciado

| Requisito | Estado |
|---|---|
| Phaser 3 no browser | Implementado com Phaser 3.90.0 via npm |
| Projeto na raiz do repositório | Sim |
| Grupo de 2 alunos | Sim |
| Suporte a 2 línguas | Português e inglês |
| Pelo menos 1 som | Vários efeitos MP3 integrados |
| Input claro | Teclado, rato, hotbar e drag and drop |
| Estado de jogo visível | Dinheiro, tempo, energia, água, inventário e quests |
| Interações/colisões | Arcade Physics, tilemaps, zonas de interação e colisão |
| README completo | Sim |
| Tag 1.0 | Sim |
