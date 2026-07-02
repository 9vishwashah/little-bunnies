import os
from bs4 import BeautifulSoup

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    idx = content.find('<!doctype html>')
    if idx == -1: return "No HTML"
    
    soup = BeautifulSoup(content[idx:], 'html.parser')
    
    # Try multiple class names where Shopify themes put content
    main = soup.find('div', class_='rte')
    if not main:
        main = soup.find('div', class_='page-content')
    if not main:
        main = soup.find('main')
    if not main:
        main = soup.body
    
    if not main:
        return "No content"
        
    lines = []
    for elem in main.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li']):
        text = elem.get_text(separator=' ', strip=True)
        if text:
            if elem.name in ['h1', 'h2']:
                lines.append(f"\n## {text}\n")
            elif elem.name in ['h3', 'h4']:
                lines.append(f"\n### {text}\n")
            elif elem.name == 'li':
                lines.append(f"- {text}")
            elif elem.name in ['p']:
                lines.append(f"{text}\n")
    
    text = '\n'.join(lines)
    if not text.strip():
        text = main.get_text(separator='\n', strip=True)
        
    text = text.replace('Rosadababy.com', 'Little Bunnies')
    text = text.replace('rosadababy.com', 'Little Bunnies')
    text = text.replace('Rosadababy', 'Little Bunnies')
    text = text.replace('rosadababy', 'Little Bunnies')
    text = text.replace('ROSADA', 'LITTLE BUNNIES')
    text = text.replace('Rosada', 'Little Bunnies')
    text = text.replace('rosada', 'Little Bunnies')
    text = text.replace('personalised kids bags and accessories, customised with your child’s name', 'prams, diaper bags, and utility bags')
    text = text.replace('Kids Bags & Accessories', 'Prams, Diaper Bags & Utility Bags')
    text = text.replace('customised with your child’s name', 'to suit your needs')
    
    return text

files = {
    'shipping': r'C:\Users\Admin\.gemini\antigravity-ide\brain\48775253-75e2-4c2d-8da8-77e78fa3706f\.system_generated\steps\92\content.md',
    'privacy': r'C:\Users\Admin\.gemini\antigravity-ide\brain\48775253-75e2-4c2d-8da8-77e78fa3706f\.system_generated\steps\93\content.md',
    'returns': r'C:\Users\Admin\.gemini\antigravity-ide\brain\48775253-75e2-4c2d-8da8-77e78fa3706f\.system_generated\steps\94\content.md',
    'terms': r'C:\Users\Admin\.gemini\antigravity-ide\brain\48775253-75e2-4c2d-8da8-77e78fa3706f\.system_generated\steps\95\content.md'
}

for name, path in files.items():
    res = process_file(path)
    with open(f'{name}.txt', 'w', encoding='utf-8') as f:
        f.write(res)
    print(f"Wrote {name}.txt")
