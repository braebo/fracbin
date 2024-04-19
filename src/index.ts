import type { Env } from './types'

import { logger } from 'hono/logger'
import { Hono } from 'hono'

import hljs from 'highlight.js'

const app = new Hono<Env>()

app.use('*', logger())

app.get('/', async c => {
	return html(/*html*/ `
        <form method="POST" action="/save">
            <label>
                <h2>Title</h2>
                <input type="text" name="title" />
            </label>
            
            <textarea name="code"></textarea>

            <select name="lang">
                <option value="ts">TypeScript</option>
                <option value="svelte">Svelte</option>
                <option value="rust">Rust</option>
            </select>
            
            <button type="submit">Submit</button>
        </form>
    `)
})

//· /:id ···································································¬

app.get('/:id', async c => {
    const data = await c.env.KV.get<Record<string, any>>(c.req.param('id'), 'json')

    if (!data) {
       return c.notFound();
    }

	return html(
        `
            <h2>${data.title}</h2>
            <pre><code>${hljs.highlight(data.code, { language: data.lang || 'js' }).value}</code></pre>
        `
    )
})
//⌟

app.post('/save', async c => {
	const form = await c.req.formData()
	console.log(form.get('oogly'))

	const data = {
		id: nanoid(),
		title: form.get('title'),
		code: form.get('code'),
	}

	await c.env.KV.put(data.id, JSON.stringify(data))

	return c.redirect(`/${data.id}`)
})

export default app

function html(slot: string) {
	return new Response(
		`<!DOCTYPE html>
        <html>
            <head>
                <style>${theme}</style>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ghostsui@1/css/ghostsui.css" />
                <style>
                    h2 {
                        text-align: center;   
                    }
                    pre {
                        width: 100%;
                        border-radius: 1rem;
                        background: rgba(var(--background-secondary-rgb), 0.3);
                        
                        margin: auto;
                        padding: 1rem;
                        width: fit-content;
                    }
                
                    code,
                    pre { 
                        font-family: 'Comic Mono', monospace
                    }
                </style>
                <meta name="darkreader-lock" />
                
            </head>
            <body>
                ${slot}
            </body>
        </html>`,
		{
			status: 200,
			headers: {
				'Content-Type': 'text/html',
			},
		},
	)
}

function nanoid(t = 21) {
	return crypto
		.getRandomValues(new Uint8Array(t))
		.reduce(
			(t, e) =>
				(t +=
					(e &= 63) < 36
						? e.toString(36)
						: e < 62
							? (e - 26).toString(36).toUpperCase()
							: e > 62
								? '-'
								: '_'),
			'',
		)
}

const theme = `/*
Date: 17.V.2011
Author: pumbur <pumbur@pumbur.net>
*/

.hljs {
    background: #222;
    color: #aaa;
  }
  
  .hljs-subst {
    color: #aaa;
  }
  
  .hljs-section {
    color: #fff;
  }
  
  .hljs-comment,
  .hljs-quote,
  .hljs-meta {
    color: #444;
  }
  
  .hljs-string,
  .hljs-symbol,
  .hljs-bullet,
  .hljs-regexp {
    color: #ffcc33;
  }
  
  .hljs-number,
  .hljs-addition {
    color: #00cc66;
  }
  
  .hljs-built_in,
  .hljs-literal,
  .hljs-type,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-link {
    color: #32aaee;
  }
  
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #6644aa;
  }
  
  .hljs-title,
  .hljs-variable,
  .hljs-deletion,
  .hljs-template-tag {
    color: #bb1166;
  }
  
  .hljs-section,
  .hljs-doctag,
  .hljs-strong {
    font-weight: bold;
  }
  
  .hljs-emphasis {
    font-style: italic;
  }
`