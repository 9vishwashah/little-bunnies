import os
import re

pages = {
    'shipping-policy': {
        'file': 'shipping.txt',
        'title': 'Shipping Policy',
        'icon': 'Truck',
        'desc': 'Read Little Bunnies\' Shipping Policy — our guidelines for delivery, shipping methods, and timelines.'
    },
    'returns': {
        'file': 'returns.txt',
        'title': 'Return & Refund Policy',
        'icon': 'RefreshCw',
        'desc': 'Read Little Bunnies\' Return & Refund Policy — our rules regarding cancellations and returns.'
    },
    'privacy-policy': {
        'file': 'privacy.txt',
        'title': 'Privacy Policy',
        'icon': 'ShieldCheck',
        'desc': 'Read Little Bunnies\' Privacy Policy — how we collect, use, and protect your information.'
    },
    'terms': {
        'file': 'terms.txt',
        'title': 'Terms of Service',
        'icon': 'FileText',
        'desc': 'Read Little Bunnies\' Terms of Service — the rules and guidelines governing your use of our website.'
    }
}

template = """import type { Metadata } from "next";
import { {icon} } from "lucide-react";

export const metadata: Metadata = {
  title: "{title}",
  description: "{desc}",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-24">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <{icon} size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-4">
            {title}
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {desc}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-10 pb-20">
        <div className="max-w-3xl mx-auto bg-white rounded-brand shadow-card p-8 md:p-12">
          <div className="prose prose-stone prose-headings:font-display prose-headings:text-ink prose-p:text-ink-light prose-li:text-ink-light prose-a:text-sage-dark hover:prose-a:text-ink max-w-none">
            {content}
          </div>
        </div>
      </section>
    </main>
  );
}
"""

for route, meta in pages.items():
    with open(meta['file'], 'r', encoding='utf-8') as f:
        text = f.read()
    
    lines = text.split('\n')
    jsx_lines = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        if not line:
            if in_list:
                jsx_lines.append("</ul>")
                in_list = False
            continue
            
        line = line.replace('{', '&#123;').replace('}', '&#125;')
        line = line.replace('<', '&lt;').replace('>', '&gt;')
        
        if line.startswith('## '):
            if in_list: jsx_lines.append("</ul>"); in_list = False
            jsx_lines.append(f"<h2>{{`{line[3:]}`}}</h2>")
        elif line.startswith('### '):
            if in_list: jsx_lines.append("</ul>"); in_list = False
            jsx_lines.append(f"<h3>{{`{line[4:]}`}}</h3>")
        elif line.startswith('- ') or line.startswith('• '):
            if not in_list:
                jsx_lines.append('<ul className="list-disc pl-5 space-y-2">')
                in_list = True
            item_text = line[2:] if line.startswith('- ') else line[2:]
            jsx_lines.append(f"<li>{{`{item_text}`}}</li>")
        else:
            if in_list: jsx_lines.append("</ul>"); in_list = False
            jsx_lines.append(f"<p>{{`{line}`}}</p>")
            
    if in_list: jsx_lines.append("</ul>")
    
    content_jsx = '\n            '.join(jsx_lines)
    
    # We have to double the braces that aren't variables for python format, or just use string replace.
    # It's safer to use string replace instead of .format for large blocks of React code.
    out_code = template
    out_code = out_code.replace('{icon}', meta['icon'])
    out_code = out_code.replace('{title}', meta['title'])
    out_code = out_code.replace('{desc}', meta['desc'])
    out_code = out_code.replace('{content}', content_jsx)
    
    out_dir = os.path.join(r'C:\Users\Admin\Desktop\LITTLE BUNNIES\little-bunnies\src\app\(shop)', route)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(out_code)
    print(f"Created {route}/page.tsx")
