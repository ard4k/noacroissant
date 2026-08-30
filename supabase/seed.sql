-- Seed Data for NOA Croissant

-- 1. Dining Tables (20 Tables)
INSERT INTO public.dining_tables (id, table_number, label, qr_token, is_active) VALUES
('tbl-01', 1, 'Masa 01', 'noa_tbl_01_a9f8b2c4e1d7', true),
('tbl-02', 2, 'Masa 02', 'noa_tbl_02_b8e7c1d3f5a9', true),
('tbl-03', 3, 'Masa 03', 'noa_tbl_03_c7d6e5f4a3b2', true),
('tbl-04', 4, 'Masa 04', 'noa_tbl_04_d6c5b4a3f2e1', true),
('tbl-05', 5, 'Masa 05', 'noa_tbl_05_e5f4a3b2c1d0', true),
('tbl-06', 6, 'Masa 06', 'noa_tbl_06_f4e3d2c1b0a9', true),
('tbl-07', 7, 'Masa 07', 'noa_tbl_07_a3b2c1d0e9f8', true),
('tbl-08', 8, 'Masa 08', 'noa_tbl_08_b2c1d0e9f8a7', true),
('tbl-09', 9, 'Masa 09', 'noa_tbl_09_c1d0e9f8a7b6', true),
('tbl-10', 10, 'Masa 10', 'noa_tbl_10_d0e9f8a7b6c5', true),
('tbl-11', 11, 'Masa 11', 'noa_tbl_11_e9f8a7b6c5d4', true),
('tbl-12', 12, 'Masa 12', 'noa_tbl_12_f8a7b6c5d4e3', true),
('tbl-13', 13, 'Masa 13', 'noa_tbl_13_a7b6c5d4e3f2', true),
('tbl-14', 14, 'Masa 14', 'noa_tbl_14_b6c5d4e3f2a1', true),
('tbl-15', 15, 'Masa 15', 'noa_tbl_15_c5d4e3f2a1b0', true),
('tbl-16', 16, 'Masa 16', 'noa_tbl_16_d4e3f2a1b0c9', true),
('tbl-17', 17, 'Masa 17', 'noa_tbl_17_e3f2a1b0c9d8', true),
('tbl-18', 18, 'Masa 18', 'noa_tbl_18_f2a1b0c9d8e7', true),
('tbl-19', 19, 'Masa 19', 'noa_tbl_19_a1b0c9d8e7f6', true),
('tbl-20', 20, 'Masa 20', 'noa_tbl_20_b0c9d8e7f6a5', true)
ON CONFLICT (id) DO UPDATE SET qr_token = EXCLUDED.qr_token;

-- 2. Categories
INSERT INTO public.categories (id, name, slug, display_order, is_active) VALUES
('cat-tatli', 'Tatlı Kruvasan', 'tatli-kruvasan', 1, true),
('cat-tuzlu', 'Tuzlu Kruvasanlar', 'tuzlu-kruvasanlar', 2, true),
('cat-soguk', 'Soğuk İçecekler', 'soguk-icecekler', 3, true),
('cat-soft', 'Soft İçecekler', 'soft-icecekler', 4, true),
('cat-sicak', 'Sıcak İçecekler', 'sicak-icecekler', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Option Groups
INSERT INTO public.option_groups (id, name, display_name, is_required, min_selection, max_selection) VALUES
('opt-pastry-extras', 'pastry_extras', 'Ekstra Tercihleri', false, 0, 2),
('opt-dolgu-amora', 'dolgu_amora', 'Dolgu Seçimi', true, 1, 1),
('opt-dolgu-roll-kup', 'dolgu_roll_kup', 'Dolgu Seçimi', true, 1, 1),
('opt-cikolata-turu', 'cikolata_turu', 'Çikolata Türü', true, 1, 1),
('opt-dondurma-porsiyon', 'dondurma_porsiyon', 'Porsiyon Seçimi', true, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Option Values
INSERT INTO public.option_values (id, option_group_id, name, price_modifier, display_order, is_default) VALUES
('extra-fistik', 'opt-pastry-extras', 'Ekstra Antep Fıstığı', 20.00, 1, false),
('extra-cikolata', 'opt-pastry-extras', 'Ekstra Çikolata', 20.00, 2, false),
('dolgu-amora-nutella', 'opt-dolgu-amora', 'Nutellalı', 0.00, 1, true),
('dolgu-amora-belcika', 'opt-dolgu-amora', 'Belçikalı', 20.00, 2, false),
('dolgu-nutella', 'opt-dolgu-roll-kup', 'Nutellalı', 0.00, 1, true),
('dolgu-belcika', 'opt-dolgu-roll-kup', 'Belçikalı', 20.00, 2, false),
('cikolata-sutlu', 'opt-cikolata-turu', 'Sütlü', 0.00, 1, true),
('cikolata-bitter', 'opt-cikolata-turu', 'Bitter', 0.00, 2, false),
('cikolata-beyaz', 'opt-cikolata-turu', 'Beyaz', 0.00, 3, false),
('porsiyon-1-top', 'opt-dondurma-porsiyon', '1 Top', 0.00, 1, true),
('porsiyon-3-top', 'opt-dondurma-porsiyon', '3 Top', 120.00, 2, false)
ON CONFLICT (id) DO NOTHING;

-- 5. Products
INSERT INTO public.products (id, category_id, name, slug, description, ingredients, base_price, is_available, is_featured, image_url, card_density, display_order) VALUES
('prod-limonlu-danish', 'cat-tatli', 'Limonlu Danish', 'limonlu-danish', 'Taze ferah limon kreması ve çıtır katmanlı tereyağlı danish hamuru.', NULL, 320.00, true, true, '/Limonlu Danish.jpg', 'large', 1),
('prod-cilekli-danish', 'cat-tatli', 'Çilekli Danish', 'cilekli-danish', 'Taze bahçe çilekleri, özel vanilyalı pastacı kreması ve pudra şekeri.', NULL, 320.00, true, true, '/Çilekli Danish.jpg', 'large', 2),
('prod-yaban-mersinli-danish', 'cat-tatli', 'Yaban Mersinli Danish', 'yaban-mersinli-danish', 'Taze yaban mersini taneleri, ipeksi krema ve karamelize çıtır katmanlar.', NULL, 340.00, true, false, '/Yaban Mersinli Danish.jpg', 'large', 3),
('prod-orman-meyveli-danish', 'cat-tatli', 'Orman Meyveli Danish', 'orman-meyveli-danish', 'Böğürtlen, yaban mersini ve frambuaz şöleni, özel ipeksi krema eşliğinde.', NULL, 340.00, true, false, '/Orman Meyveli Danish.jpg', 'large', 4),
('prod-frambuazli-danish', 'cat-tatli', 'Frambuazlı Danish', 'frambuazli-danish', 'Enfes taze frambuazlar, altın sarısı tereyağlı danish çıtırlığı.', NULL, 360.00, true, true, '/Frambuazlı Danish.jpg', 'large', 5),
('prod-mangolu-danish', 'cat-tatli', 'Mangolu Danish', 'mangolu-danish', 'Egzotik mango dilimleri ve ipeksi hafif krema dengesi.', NULL, 360.00, true, false, '/Mangolu Danish.jpg', 'large', 6),
('prod-antep-fistikli', 'cat-tatli', 'Antep Fıstıklı', 'antep-fistikli', 'Hakiki Antep fıstığı dolgusu, fıstık parçaları ve tereyağlı kruvasan lezzeti.', NULL, 350.00, true, true, '/Antep Fıstıklı.jpg', 'large', 7),
('prod-cilekli-muzlu-kremali', 'cat-tatli', 'Çilekli Muzlu Kremalı', 'cilekli-muzlu-kremali', 'Taze çilek, muz dilimleri ve hafif kadifemsi pastane kreması.', NULL, 320.00, true, false, '/Çilekli Muzlu Kremalı Kruvasan.jpg', 'large', 8),
('prod-cilekli-muzlu-nutella', 'cat-tatli', 'Çilekli Muzlu Nutella', 'cilekli-muzlu-nutella', 'Yoğun Nutella akışkanlığı, taze çilek ve muz ikilisi.', NULL, 320.00, true, true, '/Çilekli Muzlu Nutella.jpg', 'large', 9),
('prod-lotus-cruffin', 'cat-tatli', 'Lotus Cruffin', 'lotus-cruffin', 'Kruvasan hamurundan cruffin yapısı, Lotus Biscoff kreması ve bisküvi kıtırlığı.', NULL, 350.00, true, true, '/Lotus Cruffin.jpg', 'large', 10),
('prod-limonlu-twissy', 'cat-tatli', 'Limonlu Twissy', 'limonlu-twissy', 'Burgulu çıtır twissy dokusu, ferahlatıcı limon kremasıyla kaplı.', NULL, 320.00, true, false, '/Limonlu Twissy.jpg', 'large', 11),
('prod-antep-fistikli-twissy', 'cat-tatli', 'Antep Fıstıklı Twissy', 'antep-fistikli-twissy', 'Özel burgulu twissy çıtırlığı, yoğun Antep fıstığı kaplaması.', NULL, 340.00, true, false, '/Antep Fıstıklı Twissy.jpg', 'large', 12),
('prod-cikolatali-twissy', 'cat-tatli', 'Çikolatalı Twissy', 'cikolatali-twissy', 'Sütlü Belçika çikolatasıyla kaplanmış çıtır burgulu twissy.', NULL, 320.00, true, false, '/Sütlü Belçika Çikolatalı Twissy.jpg', 'large', 13),
('prod-amora', 'cat-tatli', 'Amora', 'amora', 'Özel kalp formunda çıtır kruvasan, seçiminize göre sıcak akışkan çikolata veya Nutella dolgusu.', NULL, 360.00, true, true, '/Sütlü Amora.jpg', 'large', 14),
('prod-roll-kruvasan', 'cat-tatli', 'Roll Kruvasan', 'roll-kruvasan', 'Silindirik Fransız roll kruvasan, bol iç dolgusu ve enfes çikolata kaplaması.', NULL, 340.00, true, true, '/Sütlü Roll Kruvasan.jpg', 'large', 15),
('prod-kup-kruvasan', 'cat-tatli', 'Küp Kruvasan', 'kup-kruvasan', 'Küp formunda özel fırınlanmış katmanlı kruvasan, akışkan dolgu sürprizi.', NULL, 340.00, true, true, '/Sütlü Küp Kruvasan.jpg', 'large', 16),
('prod-dondurma', 'cat-tatli', 'Dondurma', 'dondurma', 'Geleneksel kıvamında doğal taze dondurma.', NULL, 75.00, true, false, '/Dondurma.jpg', 'large', 17),

-- Tuzlular
('prod-yesil-lezzet', 'cat-tuzlu', 'Yeşil Lezzet', 'yesil-lezzet', NULL, 'Labne, Guacamole, Roka, Domates, Hindi Füme', 385.00, true, true, '/Yeşil Lezzet Kruvasan.jpg', 'horizontal', 1),
('prod-ege-esintisi', 'cat-tuzlu', 'Ege Esintisi', 'ege-esintisi', NULL, 'Haydari, Zeytin, Ton Balığı, Salatalık', 400.00, true, false, '/Ege Esintisi Kruvasan.jpg', 'horizontal', 2),
('prod-avokado-royale', 'cat-tuzlu', 'Avokado Royale', 'avokado-royale', NULL, 'Labne, Avokado, Kremalı Çırpılmış Yumurta, Kaşar Peyniri, NOA Sos', 420.00, true, true, '/Avokado Royale Kruvasan.jpg', 'horizontal', 3),
('prod-kaburga-deluxe', 'cat-tuzlu', 'Kaburga Deluxe', 'kaburga-deluxe', NULL, 'Burger Sos, Karamelize Soğan, Kaşar Peyniri, Dana Kaburga, Cheddar Sos', 420.00, true, true, '/Kaburga Deluxe Kruvasan.jpg', 'horizontal', 4),
('prod-pesto-milano', 'cat-tuzlu', 'Pesto Milano', 'pesto-milano', NULL, 'Pesto Sos, Roka, Mozzarella, Domates', 375.00, true, false, '/Pesto Milano Kruvasan.jpg', 'horizontal', 5),
('prod-kozlu-peynirli', 'cat-tuzlu', 'Közlü Peynirli', 'kozlu-peynirli', NULL, 'Labne, Köz Salata, Ezine Peyniri, Domates', 340.00, true, false, '/Közlü Peynir Kruvasan.jpg', 'horizontal', 6),
('prod-hot-dog', 'cat-tuzlu', 'Hot Dog', 'hot-dog', NULL, 'Mayonez, Çırpılmış Yumurta, Tatlı Acı Sos, Sosis, Cheddar', 350.00, true, true, '/Hot Dog Kruvasan.jpg', 'horizontal', 7),

-- Soğuk İçecekler
('prod-benzin', 'cat-soguk', 'Benzin', 'benzin', NULL, 'Pasiflora, Şeftali, Kivi, Muz, Ananas, Portakal', 250.00, true, true, '/Benzin.jpg', 'large', 1),
('prod-dizel', 'cat-soguk', 'Dizel', 'dizel', NULL, 'Kavun, Portakal, Ejder Meyvesi, Çilek, Muz', 250.00, true, true, '/Dizel.jpg', 'large', 2),
('prod-el-yapimi-limonata', 'cat-soguk', 'El Yapımı Limonata', 'el-yapimi-limonata', 'Taze sıkılmış limonlardan günlük hazırlanan soğuk ferahlık.', NULL, 160.00, true, false, '/El Yapımı Limonata.jpg', 'large', 3),
('prod-el-yapimi-nar-suyu', 'cat-soguk', 'El Yapımı Nar Suyu', 'el-yapimi-nar-suyu', 'Yüzde yüz doğal taze sıkılmış mevsim narları.', NULL, 220.00, true, false, '/El Yapımı Nar Suyu.jpg', 'large', 4),

-- Soft İçecekler
('prod-cola', 'cat-soft', 'Cola', 'cola', NULL, NULL, 100.00, true, false, NULL, 'compact', 1),
('prod-fanta', 'cat-soft', 'Fanta', 'fanta', NULL, NULL, 100.00, true, false, NULL, 'compact', 2),
('prod-sprite', 'cat-soft', 'Sprite', 'sprite', NULL, NULL, 100.00, true, false, NULL, 'compact', 3),
('prod-ice-tea', 'cat-soft', 'Ice Tea', 'ice-tea', NULL, NULL, 100.00, true, false, NULL, 'compact', 4),
('prod-sade-soda', 'cat-soft', 'Sade Soda', 'sade-soda', NULL, NULL, 50.00, true, false, NULL, 'compact', 5),
('prod-meyveli-soda', 'cat-soft', 'Meyveli Soda', 'meyveli-soda', NULL, NULL, 80.00, true, false, NULL, 'compact', 6),
('prod-uludag-frutti', 'cat-soft', 'Uludağ Frutti', 'uludag-frutti', NULL, NULL, 100.00, true, false, NULL, 'compact', 7),
('prod-su', 'cat-soft', 'Su', 'su', NULL, NULL, 40.00, true, false, NULL, 'compact', 8),

-- Sıcak İçecekler
('prod-cay', 'cat-sicak', 'Çay', 'cay', NULL, NULL, 40.00, true, false, NULL, 'compact', 1),
('prod-americano', 'cat-sicak', 'Americano', 'americano', NULL, NULL, 130.00, true, false, NULL, 'compact', 2),
('prod-sutlu-americano', 'cat-sicak', 'Sütlü Americano', 'sutlu-americano', NULL, NULL, 140.00, true, false, NULL, 'compact', 3),
('prod-cappuccino', 'cat-sicak', 'Cappuccino', 'cappuccino', NULL, NULL, 140.00, true, false, NULL, 'compact', 4),
('prod-flat-white', 'cat-sicak', 'Flat White', 'flat-white', NULL, NULL, 140.00, true, false, NULL, 'compact', 5),
('prod-latte', 'cat-sicak', 'Latte', 'latte', NULL, NULL, 140.00, true, false, NULL, 'compact', 6),
('prod-latte-macchiato', 'cat-sicak', 'Latte Macchiato', 'latte-macchiato', NULL, NULL, 140.00, true, false, NULL, 'compact', 7),
('prod-filtre-kahve', 'cat-sicak', 'Filtre Kahve', 'filtre-kahve', NULL, NULL, 130.00, true, false, NULL, 'compact', 8),
('prod-turk-kahvesi', 'cat-sicak', 'Türk Kahvesi', 'turk-kahvesi', NULL, NULL, 120.00, true, false, NULL, 'compact', 9),
('prod-espresso', 'cat-sicak', 'Espresso', 'espresso', NULL, NULL, 100.00, true, false, NULL, 'compact', 10),
('prod-double-espresso', 'cat-sicak', 'Double Espresso', 'double-espresso', NULL, NULL, 120.00, true, false, NULL, 'compact', 11)
ON CONFLICT (id) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url;

-- 6. Promotions
INSERT INTO public.promotions (id, code, title, description, is_active, type) VALUES
('promo-cay', 'UCRETSIZ_CAY', 'Tuzlu Kruvasanın Yanında Çay Bizden!', 'Sepetinizde tuzlu kruvasan bulunduğunda 1 adet ücretsiz taze demlenmiş çay hediyemiz.', true, 'tea_with_savoury')
ON CONFLICT (id) DO NOTHING;

-- 7. Settings
INSERT INTO public.settings (id, brand_name, tagline, address, phone, currency, complimentary_tea_enabled, order_accepting) VALUES
('default', 'NOA Croissant', 'Günlük taze pişirilir', 'Bağdat Caddesi No: 248, Kadıköy / İstanbul', '+90 (216) 555 0192', '₺', true, true)
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name;
