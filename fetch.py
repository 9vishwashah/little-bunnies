import urllib.request
import json
from bs4 import BeautifulSoup

urls = {
    'shipping': 'https://rosadababy.com/pages/shipping-policy',
    'privacy': 'https://rosadababy.com/pages/privacy-policy-for-rosadababy',
    'returns': 'https://rosadababy.com/pages/cancellation-and-return-policy',
    'terms': 'https://rosadababy.com/pages/terms-conditions'
}

def extract_text(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    main = soup.find('div', class_='rte') or soup.find('div', class_='page-content') or soup.find('main') or soup.body
    if not main: return "No content"
    
    # Remove script and style tags
    for script in main(["script", "style"]):
        script.extract()
        
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
    text = text.replace('ROSADA', 'LITTLE Bunnies')
    text = text.replace('Rosada', 'Little Bunnies')
    text = text.replace('rosada', 'Little Bunnies')
    text = text.replace('personalised kids bags and accessories, customised with your child’s name', 'prams, diaper bags, and utility bags')
    text = text.replace('Kids Bags & Accessories', 'Prams, Diaper Bags & Utility Bags')
    text = text.replace('customised with your child’s name', 'to suit your needs')
    
    return text

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        res = extract_text(html)
        with open(f'{name}.txt', 'w', encoding='utf-8') as f:
            f.write(res)
        print(f"Wrote {name}.txt")
    except Exception as e:
        print(f"Error fetching {name}: {e}")
