# Kolejka draftów blogowych

Ten folder to **kolejka** gotowych-do-publikacji draftów. NIE jest indeksowany (robots.txt `Disallow: /blog/drafts/`).

- `pl/`, `de/`, `en/` — drafty per język
- Skill `gajowka-blog-writer` zapisuje tu gotowe pliki HTML (z komentarzem `<!-- gajowka-draft: lang=...; tier=...; slug=...; created=...; title=... -->` na górze)
- GitHub Action `publish-blogs.yml` publikuje codziennie **4 PL + 3 DE + 3 EN** (FIFO — najstarsze drafty pierwsze), przenosząc je do `/blog/`, `/de/blog/`, `/en/blog/`
- Cel bufora: ≥7 dni na język (≥28 PL, ≥21 DE, ≥21 EN)

Drafty tutaj NIE są widoczne dla Google ani linkowane ze strony — żyją dopiero po publikacji przez Action.
