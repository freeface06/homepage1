import os
from PIL import Image

def remove_background(img_path, output_path):
    print(f"Processing {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # 검은색 배경을 투명하게 날리고 광원을 부드럽게 반투명 처리하는 기법
        # max(r, g, b)를 투명도로 사용하되, 글자의 선명성을 위해 스케일링 적용
        # 또한, 회색/흰색 글자는 알파를 255로 가깝게 유지
        brightness = max(r, g, b)
        
        # 임계값 처리: 완전히 어두운 것은 0
        if brightness < 15:
            new_data.append((0, 0, 0, 0))
        else:
            # 밝은 글자(흰색 계열)는 불투명도를 높임
            if r > 200 and g > 200 and b > 200:
                new_alpha = 255
            else:
                # 중간 네온 그라데이션 광원은 부드러운 알파 적용
                new_alpha = min(255, int(brightness * 1.2))
            
            # 색상값 보정: 배경이 검은색이었으므로, 투명해질 때 색이 칙칙해지는 것을 방지하기 위해 
            # 알파가 낮아지는 만큼 RGB 값을 밝혀줌 (Unmultiply alpha 보정)
            if new_alpha > 0:
                scale = 255.0 / new_alpha
                nr = min(255, int(r * scale))
                ng = min(255, int(g * scale))
                nb = min(255, int(b * scale))
            else:
                nr, ng, nb = r, g, b
                
            new_data.append((nr, ng, nb, new_alpha))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    img_dir = r"c:\Users\freef\workspace\homepage2\images"
    
    logo_en = os.path.join(img_dir, "logo_en.png")
    logo_ko = os.path.join(img_dir, "logo_ko.png")
    
    if os.path.exists(logo_en):
        remove_background(logo_en, logo_en)
    if os.path.exists(logo_ko):
        remove_background(logo_ko, logo_ko)
