# Translation System

## Where translations live

Translations are stored in:

```text
src/game/services/LanguageService.ts
```

Each language has its own object inside `translations`:

```ts
const translations = {
    en: {
        startGame: 'Start Game'
    },
    pt: {
        startGame: 'Começar Jogo'
    }
};
```

## How to use translated text

Import `translate` in the scene or class where text is needed:

```ts
import { translate } from '../services/LanguageService';
```

Then use the translation key instead of writing the text directly:

```ts
this.add.text(512, 500, translate('startGame'));
```
