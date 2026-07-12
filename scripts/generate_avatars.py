import base64
import os
from openai import OpenAI
from PIL import Image
from io import BytesIO

client = OpenAI(api_key="DEIN_API_KEY_HIER")

output_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "avatars")
os.makedirs(output_dir, exist_ok=True)

base_style = """
Square 1024x1024 avatar, glamorous stylized digital portrait, modern pop-art editorial style,
semi-realistic illustration, clean studio lighting, no text, no logo, no watermark,
not an official album cover, not a paparazzi photo, iconic fashion-inspired look.
"""

avatars = [
    {
        "filename": "beyonce.png",
        "prompt": f"""
        {base_style}
        A glamorous female pop icon inspired by Beyoncé, golden stage aesthetic,
        long wavy hair, confident expression, sparkling performance outfit,
        warm spotlight, luxury diva energy.
        """
    },
    {
        "filename": "ladygaga.png",
        "prompt": f"""
        {base_style}
        An avant-garde female pop icon inspired by Lady Gaga, platinum blonde hair,
        dramatic makeup, futuristic fashion outfit, eccentric glamour,
        neon lighting, high-fashion editorial mood.
        """
    },
    {
        "filename": "britney.png",
        "prompt": f"""
        {base_style}
        A female pop icon inspired by Britney Spears, blonde hair,
        Y2K pop aesthetic, sparkling stage outfit, energetic expression,
        pink and blue lighting, playful glamorous mood.
        """
    },
    {
        "filename": "cher.png",
        "prompt": f"""
        {base_style}
        A legendary pop diva inspired by Cher, very long straight dark hair,
        dramatic glamour, sparkling black outfit, powerful pose,
        retro disco and high-fashion atmosphere.
        """
    },
    {
        "filename": "tovelo.png",
        "prompt": f"""
        {base_style}
        A cool Scandinavian pop artist inspired by Tove Lo, relaxed blonde hair,
        edgy club-pop aesthetic, dark outfit, neon background,
        rebellious confident look.
        """
    },
    {
        "filename": "madonna.png",
        "prompt": f"""
        {base_style}
        An iconic pop queen inspired by Madonna, blonde hair,
        strong fashion pose, mix of 1980s pop glamour and modern elegance,
        black and silver outfit, dramatic studio light.
        """
    },
    {
        "filename": "rihanna.png",
        "prompt": f"""
        {base_style}
        A stylish female pop and R&B icon inspired by Rihanna,
        confident gaze, luxury street-glam outfit, dark hair,
        red and gold light accents, high-end editorial avatar.
        """
    },
    {
        "filename": "taylor.png",
        "prompt": f"""
        {base_style}
        A female singer-songwriter pop icon inspired by Taylor Swift,
        blonde hair with bangs, red lipstick, elegant stage look,
        warm pastel colors, dreamy pop editorial style.
        """
    },
    {
        "filename": "ariana.png",
        "prompt": f"""
        {base_style}
        A modern pop singer inspired by Ariana Grande, high ponytail,
        glamorous makeup, feminine stage outfit, pink and lavender background,
        soft light, polished digital portrait.
        """
    },
    {
        "filename": "dualipa.png",
        "prompt": f"""
        {base_style}
        A cool dance-pop icon inspired by Dua Lipa, sleek dark hair,
        futuristic disco outfit, confident pose, neon club lights,
        modern glamorous atmosphere.
        """
    },
    {
        "filename": "miley.png",
        "prompt": f"""
        {base_style}
        A bold female pop-rock icon inspired by Miley Cyrus,
        textured blonde hair, smoky eye makeup, edgy leather-inspired outfit,
        rebellious rock-pop attitude, dramatic purple and silver lighting.
        """
    },
    {
        "filename": "christina.png",
        "prompt": f"""
        {base_style}
        A glamorous powerhouse pop vocalist inspired by Christina Aguilera,
        platinum blonde hair, dramatic eyeliner, sparkling diva outfit,
        vintage Hollywood mixed with modern pop glamour,
        bright stage lights and confident expression.
        """
    },
    {
        "filename": "kylie.png",
        "prompt": f"""
        {base_style}
        An elegant dance-pop diva inspired by Kylie Minogue,
        blonde hair, glittering disco outfit, elegant pose,
        silver and golden light reflections, luxury portrait style.
        """
    },
    {
        "filename": "shakira.png",
        "prompt": f"""
        {base_style}
        A Latin pop icon inspired by Shakira, long curly blonde hair,
        energetic gaze, warm golden colors, dynamic stage background,
        vibrant performance energy.
        """
    },
    {
        "filename": "janet.png",
        "prompt": f"""
        {base_style}
        A legendary pop and R&B artist inspired by Janet Jackson,
        dark hair, iconic black stage look, confident expression,
        rhythm-inspired performance aesthetic, dramatic lighting.
        """
    },
    {
        "filename": "mariah.png",
        "prompt": f"""
        {base_style}
        A glamorous pop diva inspired by Mariah Carey,
        long wavy hair, elegant sparkling dress, warm golden lighting,
        luxury ballad stage atmosphere, soft polished portrait.
        """
    },
]

for avatar in avatars:
    output_path = os.path.join(output_dir, avatar["filename"])
    if os.path.exists(output_path):
        print(f"Überspringe {avatar['filename']} (existiert bereits)")
        continue

    print(f"Erstelle {avatar['filename']} ...")
    result = client.images.generate(
        model="gpt-image-1",
        prompt=avatar["prompt"],
        size="1024x1024"
    )

    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    image = Image.open(BytesIO(image_bytes)).convert("RGBA")
    image.save(output_path, "PNG")
    print(f"  → gespeichert: {output_path}")

print("\nFertig! Alle Avatare wurden in public/assets/avatars/ gespeichert.")
