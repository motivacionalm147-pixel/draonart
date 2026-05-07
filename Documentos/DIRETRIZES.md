# 🐉 DIRETRIZES DO DRAGON ART

Bem-vindo ao Brandbook e Guia de Interface do **Dragon Art**. 
Este documento serve como a base central para manter a consistência visual, interativa e técnica do projeto em todas as suas futuras atualizações.

---

## 🎨 1. IDENTIDADE VISUAL (Brand Guidelines)

A estética do Dragon Art é focada em ser imersiva, "premium" e fortemente inspirada no universo gamer/pixel art. O objetivo é que o app não pareça apenas uma ferramenta, mas sim um ambiente criativo.

### Paleta de Cores Base
O app segue um conceito "Dark Theme" por padrão, para dar destaque às cores do desenho do usuário.
*   **Background do App (`--bg-app`)**: `#121212` (Quase preto, não agride a visão).
*   **Superfícies/Paineis (`--bg-panel`)**: `#1e1e1e` a `#2a2a2a` (Tons de cinza escuro para modais e barras).
*   **Cor de Destaque / Ação (`--accent-color`)**: Vermelho Fogo / Azul (Dependendo do tema ativo selecionado pelo usuário). É a cor usada para botões ativos, contornos e destaques.

### Personalização (Fundos da Área de Trabalho)
O app possui uma galeria premium de fundos:
*   **Regra de Ouro do Fundo:** Qualquer imagem 4K ou ambiente (Cyberpunk, Sakura, etc.) adicionada ao fundo **deve** possuir um filtro escurecedor (overlay). 
*   **Código do Overlay:** `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))`
*   *Motivo:* O fundo deve ser ambiente e não pode ofuscar a "folha" de desenho nem os botões.

### Botões e Ícones
*   **Sombreado Obrigatório:** Para garantir que nenhum ícone fique invisível contra os fundos customizados, todos os ícones da classe `.pixel-icon-btn` devem manter seu `drop-shadow` preto pesado (`box-shadow: 2px 2px 6px rgba(0,0,0,0.9)`).
*   **Contorno de Texto:** Textos sob botões (no celular) devem usar bordas simuladas por sombras pesadas (`text-shadow: 1px 1px 2px #000...`).

---

## 📱 2. EXPERIÊNCIA E INTERFACE (UI/UX)

O Dragon Art é **Mobile-First**. Foi desenhado para ser manipulado com os polegares, mas deve escalar perfeitamente para PCs.

### Interações e Gestos (Gestures)
A tela principal de desenho precisa ficar o mais limpa possível. Usamos gestos para economizar espaço de tela:
*   **Um Dedo (Arrastar):** Desenha/Apaga.
*   **Dois Dedos (Arrastar/Girar):** Dá Zoom (Pinch), Move a folha (Pan) e Rotaciona a folha dinamicamente.
*   **Dois Cliques Rápidos (Double-tap) FORA da folha:** Desfaz a última ação (Undo). *Importante: Só funciona fora da folha para não interromper desenhos rápidos.*
*   **Segurar (Long Press):** Abre menus rápidos de ferramentas, como a roleta dinâmica Conta-gotas/Lápis/Borracha.

### Feedback Sensorial
O app precisa "conversar" com o usuário:
1.  **Audiodesign:** Toda ação, clique, erro ou confirmação deve acionar o `sound.playClick()` ou `sound.playError()`.
2.  **Háptica:** No celular, ações destrutivas (excluir quadro) ou de acionamento (undo) devem usar vibração rápida (`navigator.vibrate(50)`).

---

## 🏗️ 3. PRINCÍPIOS TÉCNICOS (Code Guidelines)

Regras estruturais para manter o código saudável e o app rápido.

*   **Matemática de Coordenadas:** A conversão de toque da tela para os pixels do Canvas (`getTransformedCoords`) é a parte mais crítica do app. Se alterar o CSS de rotação ou zoom, a matemática inversa (Deslocamento -> Escala -> Rotação) **deve** ser mantida nessa exata ordem para que o pincel não saia do lugar.
*   **Local Storage:** O Dragon Art salva tudo localmente. Sempre que uma nova preferência for criada (ex: `appBackground`), ela deve ser vinculada a um `useEffect` para salvar automaticamente no `localStorage` sob o prefixo `pixel_...`.
*   **Performance:** Não renderize a grade (Malha) se ela for muito pequena ou o zoom estiver muito distante, pois pode travar dispositivos fracos. 

---

## 🗣️ 4. TOM DE VOZ

*   **Comunicação Direta:** Textos dos tutoriais devem ser divertidos e motivadores. 
*   **Gamer Vibe:** Use termos como "Chronologia Infinita" (em vez de Histórico) ou "Aqui é onde a mágica acontece". O usuário deve sentir que está em um ambiente lúdico.
