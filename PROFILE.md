# Bastidores do Luiz OS

Perfil de Luiz Souza / @luizhss18, com identidade visual em azul, violeta e ciano. Todos os SVGs são produzidos neste repositório, sem serviço externo de badges, estatísticas ou rastreamento.

## O que está incluído

- Abertura, terminal, mapa de estudos, cards e rodapé em SVG.
- Três animações arcade: Commit Muncher (inspirado em Pac-Man), Neon Snake e Space Commits (inspirado em jogos de invasores espaciais).
- Calendário em cidade isométrica e estatísticas calculadas a partir dos mesmos dados.
- Versões clara e escura selecionadas por HTML `picture`.
- Workflow diário com execução manual, sem PAT ou serviços pagos.

Os cartuchos são animações, não jogos controláveis dentro do README. O desenho dos sprites é feito com formas SVG; não utiliza arquivos de jogos comerciais. Os números representam contribuições, que podem incluir atividades além de commits. A melhor sequência é o maior número de dias consecutivos com contribuições dentro da janela exibida.

## Atualização

O workflow `Refresh Profile Arcade` roda às 09:23 UTC (06:23 em Brasília), sujeito à fila de agendamento do GitHub. Também pode ser executado em Actions → Refresh Profile Arcade → Run workflow.

1. Faz checkout deste repositório.
2. Executa os testes do parser e dos cálculos.
3. Lê apenas o calendário público em https://github.com/users/luizhss18/contributions, sem autenticar essa leitura.
4. Valida datas, contagens e integridade do calendário antes de substituir o snapshot.
5. Gera os SVGs e publica somente se houver mudanças.

A permissão `contents: write` serve para o bot salvar os arquivos gerados neste repositório. Nenhum nome ou conteúdo de repositório privado é consultado. Em caso de erro de rede ou mudança no formato do calendário, o workflow falha e os arquivos publicados anteriormente permanecem disponíveis.

## Desenvolvimento local

Requer Node.js 20 ou mais recente, sem dependências de npm.

```sh
node --test scripts/render-profile.test.mjs
node scripts/render-profile.mjs
node scripts/render-profile.mjs --refresh
```

O primeiro comando testa os dados e cálculos. O segundo recria o visual com o snapshot existente. O terceiro consulta o calendário público atual.

## Personalização

Edite a paleta e os desenhos em `scripts/render-profile.mjs`. Atualize textos, destinos dos cards e contato em `README.md`. Após mudar os desenhos, execute o gerador e inclua os arquivos em `assets/` no commit. Para alterar os projetos, atualize também o array `projects` no gerador.

O snapshot inicial foi transcrito do calendário visível no perfil em 30/10/2026. As próximas execuções consultam diretamente a versão pública do calendário. O GitHub pode manter imagens em cache por algum tempo após uma atualização.

Documentação: [README de perfil](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme) · [Workflow e agendamento](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
