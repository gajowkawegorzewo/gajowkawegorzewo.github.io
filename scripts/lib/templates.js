/**
 * Templates for Gajówka Blog
 */

function blogPostTemplate({ title, description, content, slug, date, tags = [] }) {
  const tagsHtml = tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
  
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Blog Gajówka Mazury</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="https://gajowkawegorzewo.github.io/blog/${slug}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://gajowkawegorzewo.github.io/blog/${slug}">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #2d4a3e;
            --accent: #c5a059;
            --text: #333;
            --light: #f9f7f2;
            --white: #ffffff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Outfit', sans-serif; 
            line-height: 1.8; 
            color: var(--text); 
            background: var(--light);
        }

        header {
            background: var(--primary);
            padding: 2rem 1rem;
            text-align: center;
            color: var(--white);
        }

        .logo {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            color: var(--accent);
            text-decoration: none;
            margin-bottom: 1rem;
            display: block;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 4rem 1.5rem;
            background: var(--white);
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-top: -3rem;
            border-radius: 10px;
            position: relative;
            z-index: 10;
        }

        .post-meta {
            font-size: 0.9rem;
            color: #777;
            margin-bottom: 1.5rem;
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            line-height: 1.2;
            color: var(--primary);
            margin-bottom: 2rem;
        }

        .blog-content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            margin: 2.5rem 0 1rem;
            color: var(--primary);
        }

        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.5rem 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }

        .blog-tag {
            background: rgba(197, 160, 89, 0.1);
            color: var(--accent);
            padding: 0.2rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .cta-box {
            background: var(--primary);
            color: var(--white);
            padding: 3rem;
            border-radius: 15px;
            text-align: center;
            margin-top: 4rem;
        }

        .cta-box h3 {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--accent);
        }

        .btn {
            display: inline-block;
            background: var(--accent);
            color: var(--white);
            padding: 1rem 2.5rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin-top: 1.5rem;
            transition: transform 0.3s;
        }

        .btn:hover { transform: translateY(-3px); }

        footer {
            text-align: center;
            padding: 4rem 1rem;
            color: #777;
            font-size: 0.9rem;
        }

        @media (max-width: 600px) {
            h1 { font-size: 2rem; }
            .container { padding: 2rem 1rem; margin-top: -2rem; }
        }
    </style>
</head>
<body>

<header>
    <a href="/" class="logo">Gajówka Węgorzewo</a>
    <p>Autentyczny odpoczynek na Mazurach</p>
</header>

<main class="container">
    <div class="post-meta">
        <time datetime="${date}">${date}</time>
        ${tagsHtml}
    </div>

    <h1>${title}</h1>

    <div class="blog-content">
        ${content}
    </div>

    <div class="cta-box">
        <h3>Planujesz wyjazd na Mazury?</h3>
        <p>Gajówka to idealne miejsce na relaks blisko natury, z dala od zgiełku miasta.</p>
        <a href="/#rezerwacja" class="btn">Zarezerwuj termin</a>
    </div>
</main>

<footer>
    <p>&copy; ${new Date().getFullYear()} Gajówka Węgorzewo. Wszystkie prawa zastrzeżone.</p>
</footer>

</body>
</html>`;
}

module.exports = { blogPostTemplate };
