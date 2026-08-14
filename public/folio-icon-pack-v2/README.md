# Folio Icon Pack v2

Pacote com **10 vetores oficiais/monocromáticos** obtidos do Simple Icons
e **60 merchant badges de fallback** para marcas muito usadas no Brasil.

## Total
- 10 SVGs de marca
- 60 fallbacks visuais
- 6 ícones de categoria
- 70 entradas no `merchant-map.json`

## Como usar
Copie o conteúdo para `public/icons/`.

```tsx
<img src="/icons/brands/nubank.svg" alt="Nubank" />
```

Para reconhecimento automático:
1. normalize a descrição da transação para minúsculo;
2. compare com `merchant-map.json`;
3. use o `icon` da primeira correspondência;
4. se nenhuma marca for encontrada, use um ícone de `categories/`.

## Importante
Os arquivos da pasta `brands/` são vetores de marcas obtidos do projeto Simple Icons.
Os itens de `merchant-fallbacks/` NÃO são logos oficiais: são badges visuais criados
para funcionar como fallback no Folio sem fingir ser a identidade oficial da empresa.

Logos, nomes e marcas registradas continuam sujeitos aos direitos e brand guidelines
dos respectivos titulares.
