"""
Seeds the database with a sample category tree/recipes and the single mock
user used for all likes/favorites/submissions in this MVP (real per-user
identity is a later phase).

The category tree can nest to any depth - each node is a dict with "name"
and optionally "children" (more nested category dicts) and/or "recipes"
(a leaf list). Deliberately includes names spanning the full Turkish
alphabet (Ç Ğ I İ Ö Ş Ü) so Turkish alphabetical sorting can be visually
verified, and a 4-level branch (Ana Yemekler -> Et Yemekleri -> Köfteler)
to verify arbitrary-depth nesting works end to end.

Run with: python seed.py
"""
from database import engine, Base, SessionLocal
import models
from slugify import slugify

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

mock_user = models.User(display_name="Misafir Şef", is_mock=True)
db.add(mock_user)
db.flush()

DATA = [
    {
        "name": "Çorbalar",
        "children": [
            {
                "name": "Sebze Çorbaları",
                "recipes": [
                    {
                        "title": "Mercimek Çorbası",
                        "description": "Klasik kırmızı mercimek çorbası.",
                        "ingredients": [
                            {"name": "Kırmızı mercimek", "amount": "1", "unit": "su bardağı"},
                            {"name": "Soğan", "amount": "1", "unit": "adet"},
                            {"name": "Havuç", "amount": "1", "unit": "adet"},
                            {"name": "Un", "amount": "1", "unit": "yemek kaşığı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Soğan ve havucu ince doğrayıp kavurun."},
                            {"step_number": 2, "text": "Mercimeği ekleyip su ilave edin, pişirin."},
                            {"step_number": 3, "text": "Blenderdan geçirip servis edin."},
                        ],
                        "links": [
                            {"type": "youtube", "url": "https://www.youtube.com/watch?v=example1", "label": "Video tarif"},
                        ],
                        "like_count": 12,
                    },
                    {
                        "title": "Ezogelin Çorbası",
                        "description": "Bulgur ve kırmızı mercimekle yapılan geleneksel çorba.",
                        "ingredients": [
                            {"name": "Kırmızı mercimek", "amount": "0.5", "unit": "su bardağı"},
                            {"name": "Pirinç", "amount": "2", "unit": "yemek kaşığı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Tüm malzemeleri düdüklü tencerede haşlayın."},
                        ],
                        "links": [],
                        "like_count": 7,
                    },
                ],
            },
            {
                "name": "Et Suyu Çorbaları",
                "recipes": [
                    {
                        "title": "Tavuk Suyu Çorba",
                        "description": "Şehriyeli, tavuk suyuyla hazırlanan hafif çorba.",
                        "ingredients": [
                            {"name": "Tavuk göğsü", "amount": "1", "unit": "adet"},
                            {"name": "Şehriye", "amount": "2", "unit": "yemek kaşığı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Tavuğu haşlayıp suyunu süzün."},
                            {"step_number": 2, "text": "Şehriyeyi ekleyip pişirin."},
                        ],
                        "links": [],
                        "like_count": 4,
                    },
                ],
            },
        ],
    },
    {
        "name": "Ana Yemekler",
        "children": [
            {
                "name": "Et Yemekleri",
                "children": [
                    {
                        "name": "Köfteler",
                        "recipes": [
                            {
                                "title": "İnegöl Köfte",
                                "description": "Kaşar peynirli, ızgara İnegöl köfte.",
                                "ingredients": [
                                    {"name": "Dana kıyma", "amount": "500", "unit": "gram"},
                                    {"name": "Kaşar peyniri", "amount": "100", "unit": "gram"},
                                    {"name": "Soğan", "amount": "1", "unit": "adet"},
                                    {"name": "Karbonat", "amount": "1", "unit": "tatlı kaşığı"},
                                ],
                                "instructions": [
                                    {"step_number": 1, "text": "Kıymayı rendelenmiş soğan ve baharatlarla yoğurun."},
                                    {"step_number": 2, "text": "Köfteleri şekillendirip dinlendirin."},
                                    {"step_number": 3, "text": "Izgarada veya tavada çevirerek pişirin."},
                                ],
                                "links": [],
                                "like_count": 18,
                            },
                        ],
                    },
                    {
                        "name": "Kebaplar",
                        "recipes": [
                            {
                                "title": "İskender Kebap",
                                "description": "Yoğurtlu, tereyağlı domates soslu kebap.",
                                "ingredients": [
                                    {"name": "Döner et", "amount": "200", "unit": "gram"},
                                    {"name": "Pide ekmeği", "amount": "1", "unit": "adet"},
                                    {"name": "Yoğurt", "amount": "0.5", "unit": "su bardağı"},
                                ],
                                "instructions": [
                                    {"step_number": 1, "text": "Pideyi dilimleyip tabana serin."},
                                    {"step_number": 2, "text": "Eti üzerine, yoğurt ve sos ile servis edin."},
                                ],
                                "links": [
                                    {"type": "youtube", "url": "https://www.youtube.com/watch?v=example2", "label": "İskender nasıl yapılır"},
                                ],
                                "like_count": 15,
                            },
                        ],
                    },
                    {
                        "name": "Güveç ve Kuru Yemekler",
                        "recipes": [
                            {
                                "title": "Kuru Fasulye",
                                "description": "Etli kuru fasulye, pilav ile servis edilir.",
                                "ingredients": [
                                    {"name": "Kuru fasulye", "amount": "2", "unit": "su bardağı"},
                                    {"name": "Kuşbaşı et", "amount": "200", "unit": "gram"},
                                ],
                                "instructions": [
                                    {"step_number": 1, "text": "Fasulyeyi bir gece suda bekletin."},
                                    {"step_number": 2, "text": "Eti kavurup fasulye ile birlikte pişirin."},
                                ],
                                "links": [],
                                "like_count": 20,
                            },
                        ],
                    },
                ],
            },
            {
                "name": "Zeytinyağlılar",
                "recipes": [
                    {
                        "title": "İmam Bayıldı",
                        "description": "Zeytinyağlı, soğanlı, domatesli patlıcan yemeği.",
                        "ingredients": [
                            {"name": "Patlıcan", "amount": "4", "unit": "adet"},
                            {"name": "Soğan", "amount": "2", "unit": "adet"},
                            {"name": "Zeytinyağı", "amount": "1", "unit": "su bardağı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Patlıcanları kızartın."},
                            {"step_number": 2, "text": "İç harcı hazırlayıp patlıcanların içine doldurun."},
                            {"step_number": 3, "text": "Fırında pişirin, soğuk servis edin."},
                        ],
                        "links": [],
                        "like_count": 9,
                    },
                    {
                        "title": "Ispanaklı Börek",
                        "description": "Ispanak ve peynirle hazırlanan yufkalı börek.",
                        "ingredients": [
                            {"name": "Yufka", "amount": "4", "unit": "adet"},
                            {"name": "Ispanak", "amount": "1", "unit": "demet"},
                            {"name": "Beyaz peynir", "amount": "100", "unit": "gram"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Ispanağı haşlayıp doğrayın, peynirle karıştırın."},
                            {"step_number": 2, "text": "Yufkaların arasına harcı koyup rulo yapın."},
                            {"step_number": 3, "text": "Fırında altın rengi olana kadar pişirin."},
                        ],
                        "links": [],
                        "like_count": 6,
                    },
                ],
            },
        ],
    },
    {
        "name": "Tatlılar",
        "children": [
            {
                "name": "Şerbetli Tatlılar",
                "recipes": [
                    {
                        "title": "Baklava",
                        "description": "Cevizli veya fıstıklı, şerbetli klasik Türk tatlısı.",
                        "ingredients": [
                            {"name": "Yufka", "amount": "20", "unit": "adet"},
                            {"name": "Ceviz", "amount": "2", "unit": "su bardağı"},
                            {"name": "Şeker", "amount": "3", "unit": "su bardağı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Yufkaları tereyağı ile katlayıp ceviz serpin."},
                            {"step_number": 2, "text": "Dilimleyip fırında pişirin."},
                            {"step_number": 3, "text": "Sıcak baklavaya soğuk şerbet dökün."},
                        ],
                        "links": [
                            {"type": "youtube", "url": "https://www.youtube.com/watch?v=example3", "label": "Ev yapımı baklava"},
                        ],
                        "like_count": 25,
                    },
                    {
                        "title": "Şekerpare",
                        "description": "Bademli, şerbetli küçük kurabiye tatlısı.",
                        "ingredients": [
                            {"name": "Un", "amount": "3", "unit": "su bardağı"},
                            {"name": "Şeker", "amount": "1", "unit": "su bardağı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Hamuru yoğurup küçük toplar halinde şekillendirin."},
                            {"step_number": 2, "text": "Pişirip sıcakken şerbet dökün."},
                        ],
                        "links": [],
                        "like_count": 8,
                    },
                ],
            },
            {
                "name": "Sütlü Tatlılar",
                "recipes": [
                    {
                        "title": "Sütlaç",
                        "description": "Fırında üstü kızarmış geleneksel sütlü tatlı.",
                        "ingredients": [
                            {"name": "Süt", "amount": "1", "unit": "litre"},
                            {"name": "Pirinç", "amount": "0.5", "unit": "su bardağı"},
                            {"name": "Şeker", "amount": "1", "unit": "su bardağı"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Pirinci haşlayıp süt ve şeker ile pişirin."},
                            {"step_number": 2, "text": "Kaselere alıp fırında üstünü kızartın."},
                        ],
                        "links": [],
                        "like_count": 11,
                    },
                ],
            },
        ],
    },
    {
        "name": "Salatalar",
        "children": [
            {
                "name": "Yeşil Salatalar",
                "recipes": [
                    {
                        "title": "Çoban Salatası",
                        "description": "Domates, salatalık, soğan ve biberden yapılan taze salata.",
                        "ingredients": [
                            {"name": "Domates", "amount": "2", "unit": "adet"},
                            {"name": "Salatalık", "amount": "2", "unit": "adet"},
                            {"name": "Soğan", "amount": "1", "unit": "adet"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Tüm sebzeleri küp küp doğrayın."},
                            {"step_number": 2, "text": "Zeytinyağı, limon ve tuz ile karıştırın."},
                        ],
                        "links": [],
                        "like_count": 5,
                    },
                ],
            },
        ],
    },
    {
        "name": "Kahvaltılık",
        "children": [
            {
                "name": "Börekler",
                "recipes": [
                    {
                        "title": "Su Böreği",
                        "description": "Katmer katmer, peynirli klasik su böreği.",
                        "ingredients": [
                            {"name": "Yufka", "amount": "10", "unit": "adet"},
                            {"name": "Beyaz peynir", "amount": "200", "unit": "gram"},
                            {"name": "Yumurta", "amount": "3", "unit": "adet"},
                        ],
                        "instructions": [
                            {"step_number": 1, "text": "Yufkaları kaynar suda haşlayın."},
                            {"step_number": 2, "text": "Tepside peynirli harç ile katlayın."},
                            {"step_number": 3, "text": "Üzerine yumurta-süt karışımı gezdirip fırınlayın."},
                        ],
                        "links": [],
                        "like_count": 10,
                    },
                ],
            },
        ],
    },
]


def insert_node(name, parent_id, children=None, recipes=None):
    category = models.Category(name=name, slug=slugify(name), parent_id=parent_id)
    db.add(category)
    db.flush()

    for child in children or []:
        insert_node(child["name"], category.id, child.get("children"), child.get("recipes"))

    for recipe_data in recipes or []:
        db.add(models.Recipe(
            category_id=category.id,
            title=recipe_data["title"],
            slug=slugify(recipe_data["title"]),
            description=recipe_data["description"],
            ingredients=recipe_data["ingredients"],
            instructions=recipe_data["instructions"],
            links=recipe_data["links"],
            like_count=recipe_data["like_count"],
            created_by_user_id=mock_user.id,
        ))

    return category


for node in DATA:
    insert_node(node["name"], None, node.get("children"), node.get("recipes"))

db.commit()
db.close()

print("Tarifhane veritabanı örnek verilerle dolduruldu.")
