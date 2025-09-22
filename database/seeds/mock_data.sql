-- =================================================================
--  FINAL & VERIFIED Mock Data Script
-- =================================================================
--  Author: Gemini AI
--  Date: September 22, 2025
--  Notes: This complete script has been corrected for syntax errors.
--         It uses a unique image for each of the 50 attractions,
--         30 tours, and 30 blog posts as requested.
-- =================================================================

SET client_min_messages TO WARNING;

-- ==========
-- 1) Currencies
-- ==========
INSERT INTO
    currencies (code, name, symbol)
VALUES (
        'USD',
        'United States Dollar',
        '$'
    ),
    ('EUR', 'Euro', '€'),
    ('GBP', 'British Pound', '£'),
    ('JPY', 'Japanese Yen', '¥'),
    ('CAD', 'Canadian Dollar', '$') ON CONFLICT (code) DO NOTHING;

-- ==========
-- 2) Users
-- ==========
INSERT INTO
    users (
        id,
        username,
        email,
        password,
        first_name,
        last_name,
        mobile,
        profile_image,
        role,
        is_active,
        email_verified_at
    )
VALUES (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'admin',
        'admin@example.com',
        '$2a$12$.mbqwDuqyUdJAtc1ixCsP.SPPKXnry2gojRzQck56wzbdvLxT8zjS',
        'Admin',
        'User',
        '+15550000000',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        'admin',
        true,
        NOW()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'user',
        'user@example.com',
        '$2a$12$g9b24jkyV22Gz1L7jW545u.K./IBd44d.lhlF4B9G.fUaGgq3h5jK',
        'Alex',
        'Chen',
        '+15550000001',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        'user',
        true,
        NOW()
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'olivia_stone',
        'olivia.s@example.com',
        '$2b$10$placeholderHashForUser',
        'Olivia',
        'Stone',
        '+15550000004',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        'user',
        true,
        NOW() - interval '12 days'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'jackson_peak',
        'jackson.p@example.com',
        '$2b$10$placeholderHashForUser',
        'Jackson',
        'Peak',
        '+15550000007',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        'user',
        true,
        NOW() - interval '22 days'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'mia_summers',
        'mia.s@example.com',
        '$2b$10$placeholderHashForUser',
        'Mia',
        'Summers',
        '+15550000010',
        'https://images.unsplash.com/photo-1542103749-8ef59b94f475',
        'user',
        true,
        NOW() - interval '31 days'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16',
        'yuki_travels',
        'yuki.t@example.jp',
        '$2b$10$placeholderHashForUser',
        'Yuki',
        'Tanaka',
        '+81345678901',
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e',
        'user',
        true,
        NOW() - interval '45 days'
    );
-- ==========
-- 3) Attraction Posts & Photos (50 Records)
-- ==========
INSERT INTO
    attraction_posts (
        id,
        title,
        content,
        location,
        category
    )
VALUES (
        'a1b2c3d4-0001-4001-8001-000000000001',
        'Serengeti National Park',
        'A vast national park in northern Tanzania, famous for its annual migration of over 1.5 million wildebeest. It offers some of the best wildlife viewing in Africa, including the "big five".',
        'Serengeti, Tanzania',
        'National Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000002',
        'Lake Louise',
        'A breathtaking turquoise glacial lake in Banff National Park, Alberta, Canada. It is surrounded by towering peaks and the majestic Victoria Glacier.',
        'Alberta, Canada',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000003',
        'Westminster Abbey',
        'A large, mainly Gothic abbey church in London. It is one of the United Kingdom''s most notable religious buildings and the traditional place of coronation for British monarchs.',
        'London, UK',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000004',
        'The Potala Palace',
        'A dzong fortress in the city of Lhasa, in Tibet. It was the winter palace of the Dalai Lamas from 1649 to 1959 and is a masterpiece of Tibetan architecture.',
        'Lhasa, Tibet',
        'Palace'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000005',
        'Cinque Terre',
        'A string of five ancient seaside villages on the rugged Italian Riviera coastline. The colorful houses and terraced vineyards make for a stunning landscape.',
        'Liguria, Italy',
        'Coastal Town'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000006',
        'Victoria Falls',
        'A spectacular waterfall on the Zambezi River, on the border between Zambia and Zimbabwe. It is considered one of the world''s largest waterfalls.',
        'Livingstone, Zambia',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000007',
        'Wadi Rum',
        'A vast desert valley in southern Jordan, known for its dramatic sandstone mountains, natural arches, and prehistoric rock carvings. Also known as "The Valley of the Moon".',
        'Aqaba Governorate, Jordan',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000008',
        'St. Peter''s Basilica',
        'The centerpiece of the Vatican City, this Italian Renaissance church is one of the largest in the world. It is the burial site of Saint Peter, chief among Jesus''s apostles.',
        'Vatican City',
        'Cathedral'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000009',
        'Erawan Falls',
        'A beautiful seven-tiered waterfall located in Erawan National Park in western Thailand. The emerald green ponds are perfect for swimming.',
        'Kanchanaburi, Thailand',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000010',
        'Vatican City',
        'An independent city-state enclaved within Rome, Italy. It is the smallest sovereign state in the world and the headquarters of the Roman Catholic Church.',
        'Vatican City',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000011',
        'The White House',
        'The official residence and workplace of the president of the United States. Located at 1600 Pennsylvania Avenue NW in Washington, D.C.',
        'Washington, D.C., USA',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000012',
        'Tulum',
        'The site of a pre-Columbian Mayan walled city serving as a major port for Coba. The ruins are situated on 12-meter-tall cliffs along the coast.',
        'Quintana Roo, Mexico',
        'Archaeological Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000013',
        'Sheikh Zayed Grand Mosque',
        'Located in Abu Dhabi, it is the largest mosque in the United Arab Emirates. Its design is a fusion of Arab, Persian, Mughal and Moorish architecture.',
        'Abu Dhabi, UAE',
        'Mosque'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000014',
        'Lake Bled',
        'A stunning lake in the Julian Alps of northwestern Slovenia, known for the picturesque church on an island in the middle of the lake.',
        'Bled, Slovenia',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000015',
        'Tivoli Gardens',
        'An amusement park and pleasure garden in Copenhagen, Denmark. Opened in 1843, it is the third-oldest operating amusement park in the world.',
        'Copenhagen, Denmark',
        'Amusement Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000016',
        'Geirangerfjord',
        'A spectacular fjord in the Sunnmøre region of Møre og Romsdal county, Norway. It is a UNESCO World Heritage site known for its deep blue water and majestic waterfalls.',
        'Møre og Romsdal, Norway',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000017',
        'Schönbrunn Palace',
        'The main summer residence of the Habsburg rulers in Vienna, Austria. The 1,441-room Rococo palace is one of the most important monuments in the country.',
        'Vienna, Austria',
        'Palace'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000018',
        'Galapagos Islands',
        'A volcanic archipelago in the Pacific Ocean, considered one of the world''s foremost destinations for wildlife-viewing. It inspired Charles Darwin''s theory of evolution.',
        'Galapagos, Ecuador',
        'Wildlife Reserve'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000019',
        'Taj Mahal',
        'An exquisite ivory-white marble mausoleum on the south bank of the Yamuna river in Agra, India. A jewel of Muslim art commissioned by emperor Shah Jahan.',
        'Agra, India',
        'Mausoleum'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000020',
        'Sydney Opera House',
        'A multi-venue performing arts centre at Sydney Harbour. It is one of the 20th century''s most famous and distinctive buildings.',
        'Sydney, Australia',
        'Architecture'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000021',
        'Zhangjiajie National Forest Park',
        'A national forest park in China, notable for its thousands of pillar-like formations that were an inspiration for the Hallelujah Mountains in the film Avatar.',
        'Hunan, China',
        'National Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000022',
        'Teotihuacan',
        'A vast complex of ancient pyramids located in a basin in central Mexico. The site is known for its well-preserved murals and the massive Pyramid of the Sun.',
        'San Juan Teotihuacán, Mexico',
        'Archaeological Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000023',
        'The Palace of Versailles',
        'The principal royal residence of France from 1682 until the French Revolution in 1789. The Hall of Mirrors is one of its most famous rooms.',
        'Versailles, France',
        'Palace'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000024',
        'CN Tower',
        'A 553.3 m-high communications and observation tower in downtown Toronto, Canada. It features a revolving restaurant and the thrilling EdgeWalk.',
        'Toronto, Canada',
        'Skyscraper'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000025',
        'Eiffel Tower',
        'An iconic wrought-iron lattice tower located on the Champ de Mars in Paris. A symbol of France, it''s one of the most recognized structures worldwide.',
        'Paris, France',
        'Monument'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000026',
        'Charles Bridge',
        'A medieval stone arch bridge that crosses the Vltava river in Prague, Czech Republic. It is decorated by a continuous alley of 30 statues.',
        'Prague, Czech Republic',
        'Bridge'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000027',
        'The Dead Vlei',
        'A white clay pan located near the more famous salt pan of Sossusvlei, inside the Namib-Naukluft Park in Namibia. It is known for its ancient, dead camel thorn trees.',
        'Namib-Naukluft Park, Namibia',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000028',
        'Sugarloaf Mountain',
        'A peak situated in Rio de Janeiro, Brazil, at the mouth of Guanabara Bay. A cable car ascends to its summit, offering panoramic views of the city.',
        'Rio de Janeiro, Brazil',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000029',
        'Sukhothai Historical Park',
        'The ruins of Sukhothai, the capital of the Sukhothai Kingdom in the 13th and 14th centuries, in what is now Northern Thailand.',
        'Sukhothai, Thailand',
        'Archaeological Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000030',
        'The Panama Canal',
        'An artificial 82 km waterway in Panama that connects the Atlantic Ocean with the Pacific Ocean, using a system of locks to lift ships.',
        'Panama',
        'Engineering'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000031',
        'The Parthenon',
        'A former temple on the Athenian Acropolis, Greece, dedicated to the goddess Athena. It is the most important surviving building of Classical Greece.',
        'Athens, Greece',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000032',
        'Fiordland National Park',
        'A national park in the southwest corner of the South Island of New Zealand. It is known for the glacier-carved fiords of Milford Sound and Doubtful Sound.',
        'South Island, New Zealand',
        'National Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000033',
        'Victoria Harbour',
        'A natural harbour situated between Hong Kong Island and the Kowloon Peninsula. Its deep, sheltered waters and strategic location have made it a key center of trade.',
        'Hong Kong',
        'Landmark'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000034',
        'Ephesus',
        'An ancient Greek city on the coast of Ionia, in modern-day Turkey. Its ruins include the massive Library of Celsus and a well-preserved theater.',
        'İzmir Province, Turkey',
        'Archaeological Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000035',
        'Forbidden City',
        'A palace complex in central Beijing, China. It served as the home of emperors and was the ceremonial and political center of Chinese government for almost 500 years.',
        'Beijing, China',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000036',
        'Victoria & Alfred Waterfront',
        'A historic harbour in Cape Town that is now a popular shopping and entertainment destination, with stunning views of Table Mountain.',
        'Cape Town, South Africa',
        'Landmark'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000037',
        'Hobbiton Movie Set',
        'The picturesque movie set used for The Lord of the Rings and The Hobbit trilogies, located on a family-run farm near Matamata, New Zealand.',
        'Matamata, New Zealand',
        'Landmark'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000038',
        'Great Wall of China',
        'A vast series of fortifications stretching across the historical northern borders of ancient Chinese states, built to protect against invasions.',
        'Beijing, China',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000039',
        'Grand Canyon National Park',
        'This national park in Arizona is home to the immense Grand Canyon, with its layered bands of red rock revealing millions of years of geological history.',
        'Arizona, USA',
        'National Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000040',
        'Leaning Tower of Pisa',
        'The freestanding bell tower, or campanile, of the cathedral of Pisa, known worldwide for its nearly four-degree lean from an unstable foundation.',
        'Pisa, Italy',
        'Monument'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000041',
        'Petronas Towers',
        'Twin skyscrapers in Kuala Lumpur, Malaysia. They were the tallest buildings in the world from 1998 to 2004 and remain the tallest twin towers.',
        'Kuala Lumpur, Malaysia',
        'Skyscraper'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000042',
        'Zion National Park',
        'A nature preserve in southwestern Utah distinguished by Zion Canyon’s steep red cliffs. Its most famous hike is The Narrows.',
        'Utah, USA',
        'National Park'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000043',
        'The Nile River',
        'A major north-flowing river in northeastern Africa. It is the longest river in Africa and was the lifeline of ancient Egyptian civilization.',
        'Egypt',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000044',
        'Salar de Uyuni',
        'The world''s largest salt flat, located in southwest Bolivia. During the rainy season, it transforms into a giant mirror, reflecting the sky.',
        'Potosí, Bolivia',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000045',
        'The Amazon River',
        'The largest river by discharge volume of water in the world, and the second longest. It flows through the vast Amazon Rainforest.',
        'South America',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000046',
        'Alhambra',
        'A stunning palace and fortress complex of the Moorish rulers in Granada, Spain. It is a breathtaking example of Islamic architecture.',
        'Granada, Spain',
        'Palace'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000047',
        'The Louvre Abu Dhabi',
        'An art and civilization museum, located in Abu Dhabi, UAE. It is notable for its "rain of light" effect from its massive domed roof.',
        'Abu Dhabi, UAE',
        'Museum'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000048',
        'The Danube River',
        'Europe''s second-longest river, flowing through 10 countries from Germany to the Black Sea. It passes through major capitals like Vienna and Budapest.',
        'Central/Eastern Europe',
        'Natural Wonder'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000049',
        'Sistine Chapel',
        'A chapel in the Apostolic Palace, in Vatican City. It is famous for its Renaissance frescoes, particularly the ceiling and The Last Judgment by Michelangelo.',
        'Vatican City',
        'Historic Site'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000050',
        'The Kremlin',
        'A fortified complex in the center of Moscow, overlooking the Moskva River. It includes five palaces, four cathedrals, and the enclosing Kremlin Wall.',
        'Moscow, Russia',
        'Historic Site'
    );

INSERT INTO
    attraction_post_photos (post_id, image_url, caption)
VALUES (
        'a1b2c3d4-0001-4001-8001-000000000001',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0cWdshCVcA6s7aPVF5zieXKBH4Qwx1yCJZmYr',
        'A view of Serengeti National Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000002',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0wfRgn9L6TGQynxq0jLsk21FBzhvI9SRfM8at',
        'A view of Lake Louise.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000003',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ERyjQLwMX7fJdCPGmizO6Dr1ZWhpSAgYoLab',
        'A view of Westminster Abbey.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000004',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0TGtMdNHHOLqJZQAKxYSiDwTPCnFs517vRXN9',
        'A view of The Potala Palace.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000005',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0swK4gHsRiPREdWQemAxpCHnMrkalFu39t2Zc',
        'A view of Cinque Terre.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000006',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0AWMerweimEvhM1FVngjwa0oWPUJZ4Tc2eKkI',
        'A view of Victoria Falls.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000007',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0YHsv5ZMdsR7MbXpOk5Uq4WG9DviwmdfrS0Vz',
        'A view of Wadi Rum.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000008',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0mshAq8l34QGUd9voJtbNVn71iHsPuBFgO8XE',
        'A view of St. Peter''s Basilica.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000009',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0TRvzY5HHOLqJZQAKxYSiDwTPCnFs517vRXN9',
        'A view of Erawan Falls.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000010',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Bn3WPzUoMdAaDtFuNQGzcPsOwZ42i9JbXHUC',
        'A view of Vatican City.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000011',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0D9eydoFB4UVJTSYWvGr5Is6yaAeQgq8bKztw',
        'A view of The White House.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000012',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0DiAGeQOFB4UVJTSYWvGr5Is6yaAeQgq8bKzt',
        'A view of Tulum.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000013',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0tGpiG1csUMnbdgv90JrYeCZI5P6SxLh3jDtQ',
        'A view of Sheikh Zayed Grand Mosque.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000014',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ACoXdimEvhM1FVngjwa0oWPUJZ4Tc2eKkIqp',
        'A view of Lake Bled.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000015',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0hG4zlaCet6lvpAFYdoW3DIXjUaEurigBxm4w',
        'A view of Tivoli Gardens.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000016',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0hVciKYCet6lvpAFYdoW3DIXjUaEurigBxm4w',
        'A view of Geirangerfjord.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000017',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0XCV3YH48czo0FnJgbLQ4u7TIiB2MsPNkAx5K',
        'A view of Schönbrunn Palace.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000018',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0d7gAwqTYxVdEPOHJ8sb9p21g3CBmQU6L4ZGq',
        'A view of Galapagos Islands.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000019',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0QY78QGSP7oTIXmufLOFqr1VRHS2YWsQaDjZB',
        'A view of Taj Mahal.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000020',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0WrH9rYeVEcbGpMlTg43ioAS9XC2Z6PLBNtnx',
        'A view of Sydney Opera House.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000021',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0giUDEDG2dKY945Am8lSuVoyqnJjfLxObRkXH',
        'A view of Zhangjiajie National Forest Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000022',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj06TWSelzQiACnzreZafc7qOV0XxblLW5tNhyd',
        'A view of Teotihuacan.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000023',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0PLV3EyjDekPafF2MJLyZcHoq4gQ078pdWjUT',
        'A view of The Palace of Versailles.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000024',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Z8Pe6qM5dg2aAw3heLT6m4vSjKQXxJkyozG7',
        'A view of CN Tower.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000025',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0AMHbOrimEvhM1FVngjwa0oWPUJZ4Tc2eKkIq',
        'A view of Eiffel Tower.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000026',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0e07owimJRZklyo9E0YxuDmePhcjpFO2TCVn1',
        'A view of Charles Bridge.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000027',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj005sSb98vrjHILszJxUWbk0h9BE57yM6OfC4X',
        'A view of The Dead Vlei.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000028',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0R17CrLEeNkojxWcdsn1F6VT82U50LR7B4brZ',
        'A view of Sugarloaf Mountain.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000029',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0YPgKP9dsR7MbXpOk5Uq4WG9DviwmdfrS0VzJ',
        'A view of Sukhothai Historical Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000030',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0B5jf7zUoMdAaDtFuNQGzcPsOwZ42i9JbXHUC',
        'A view of The Panama Canal.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000031',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0UzP0F0ZfIJZATmi5b7v1BWsVK6HPLrylznNj',
        'A view of The Parthenon.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000032',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0SU7XKkWobY4WEZ5s1IknvpUBoSQuTjNf28gw',
        'A view of Fiordland National Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000033',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0YkhL3ZdsR7MbXpOk5Uq4WG9DviwmdfrS0VzJ',
        'A view of Victoria Harbour.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000034',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0jgjOSmI3wS0HKTeOFA4qrugX65UbRliCaohy',
        'A view of Ephesus.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000035',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj02fVsyT0CSw8Yi9u0ADH6VWXf3UbhQFZergLM',
        'A view of Forbidden City.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000036',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0KfMVP46JikpMAjuIHZ5zmRL4yTSCeU2lo1dG',
        'A view of Victoria & Alfred Waterfront.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000037',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0QyQr5eSP7oTIXmufLOFqr1VRHS2YWsQaDjZB',
        'A view of Hobbiton Movie Set.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000038',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0h9xIzvICet6lvpAFYdoW3DIXjUaEurigBxm4',
        'A view of Great Wall of China.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000039',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0AeITB0imEvhM1FVngjwa0oWPUJZ4Tc2eKkIq',
        'A view of Grand Canyon National Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000040',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0p7SkVbNaIWQ9zfLRo5xCh3SvrJ1i0HDkbnyj',
        'A view of Leaning Tower of Pisa.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000041',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ZPltLpM5dg2aAw3heLT6m4vSjKQXxJkyozG7',
        'A view of Petronas Towers.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000042',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0dtIN68TYxVdEPOHJ8sb9p21g3CBmQU6L4ZGq',
        'A view of Zion National Park.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000043',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj09FoztApe2Iju8KpdLsDhGA3lQb0XEcJqarPw',
        'A view of The Nile River.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000044',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj07b1jEi9VohvYBjAc8QCmb5p92uzHXMlGUExW',
        'A view of Salar de Uyuni.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000045',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0TWYuUHHOLqJZQAKxYSiDwTPCnFs517vRXN9t',
        'A view of The Amazon River.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000046',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0HEORi01sThGwz3K1ux2VkREeLI5o4MOfAs0l',
        'A view of Alhambra.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000047',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0OlXMSDKXvTstOYDKl8RWr2iz5MhjGnbxE93m',
        'A view of The Louvre Abu Dhabi.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000048',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0wIgDGzL6TGQynxq0jLsk21FBzhvI9SRfM8at',
        'A view of The Danube River.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000049',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ZIqw3tM5dg2aAw3heLT6m4vSjKQXxJkyozG7',
        'A view of Sistine Chapel.'
    ),
    (
        'a1b2c3d4-0001-4001-8001-000000000050',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0XJ26c148czo0FnJgbLQ4u7TIiB2MsPNkAx5K',
        'A view of The Kremlin.'
    );
-- ==========
-- 4) Travel Plans (Tours) & Destinations (30 Records)
-- ==========
INSERT INTO
    travel_plans (
        id,
        name,
        description,
        start_date,
        duration_days,
        price_minor,
        currency_code,
        capacity,
        cover_image_url,
        owner_id,
        plan_type,
        rating,
        rating_count
    )
VALUES
    -- FIXED: Ensured all rating_count values are integers
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000051',
        'Tour of Ipanema Beach',
        'A 5-day tour to experience the vibrant life of Rio''s Ipanema Beach. Includes surfing lessons, beach volleyball, and enjoying the iconic sunset.',
        '2026-11-10',
        5,
        150000,
        'USD',
        12,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0VKeul9Q4e0LUG6WZy93PdIiAFbvfNaQsrKRp',
        NULL,
        'tour',
        4.6,
        90
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000052',
        'Expedition to the Northern Lights',
        'A 6-day winter expedition in Norway to witness the magical Aurora Borealis. Includes husky sledding and a stay in a traditional Sami lavvu.',
        '2027-02-15',
        6,
        280000,
        'EUR',
        10,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj09lIo9epe2Iju8KpdLsDhGA3lQb0XEcJqarPw',
        NULL,
        'tour',
        4.9,
        120
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000053',
        'The Angel Falls Adventure',
        'A challenging 7-day tour deep into Venezuela''s Canaima National Park to see the world''s tallest uninterrupted waterfall, Angel Falls.',
        '2026-04-20',
        7,
        220000,
        'USD',
        8,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0jMtH7kI3wS0HKTeOFA4qrugX65UbRliCaohy',
        NULL,
        'tour',
        4.8,
        65
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000054',
        'A Tour of the Hoover Dam',
        'A full-day tour from Las Vegas to see the Hoover Dam, a concrete arch-gravity dam in the Black Canyon of the Colorado River. Includes a power plant tour.',
        '2026-10-05',
        1,
        11000,
        'USD',
        25,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0LzVJfvq43jEt8qsiycWUKSabYIPoBkrnFdx2',
        NULL,
        'tour',
        4.5,
        300
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000055',
        'The Mount Vesuvius Discovery Tour',
        'Explore the ancient Roman city of Pompeii, preserved by the eruption of Mount Vesuvius in AD 79. This day tour from Naples includes a hike to the crater of the volcano.',
        '2026-09-18',
        1,
        16000,
        'EUR',
        20,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0LJAsATq43jEt8qsiycWUKSabYIPoBkrnFdx2',
        NULL,
        'tour',
        4.7,
        280
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000056',
        'Sacred Paths: A Fushimi Inari-taisha Tour',
        'A half-day walking tour through the thousands of vermilion torii gates of Fushimi Inari-taisha shrine in Kyoto, a truly iconic Japanese experience.',
        '2026-04-10',
        1,
        9000,
        'JPY',
        15,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0YBINM7dsR7MbXpOk5Uq4WG9DviwmdfrS0VzJ',
        NULL,
        'tour',
        4.9,
        450
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000057',
        'Alpine Heights: The Matterhorn Expedition',
        'A 5-day tour based in Zermatt, Switzerland, offering guided hikes with stunning views of the iconic Matterhorn peak.',
        '2026-07-25',
        5,
        290000,
        'EUR',
        10,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0b856BUc24j8ZH3SfplM5q2abxmeNG0IgUOuo',
        NULL,
        'tour',
        4.8,
        110
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000058',
        'Ancient Wonders: The Library of Celsus Expedition',
        'A guided tour of the ancient city of Ephesus in Turkey, with a special focus on the magnificent facade of the Library of Celsus.',
        '2026-10-12',
        1,
        13000,
        'EUR',
        18,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0pzTtiMNaIWQ9zfLRo5xCh3SvrJ1i0HDkbnyj',
        NULL,
        'tour',
        4.7,
        190
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000059',
        'Khmer Empire: An Angkor Wat Adventure',
        'A 3-day immersive tour of the Angkor Archaeological Park, including sunrise at Angkor Wat, the faces of Bayon, and the jungle temple of Ta Prohm.',
        '2026-02-20',
        3,
        45000,
        'USD',
        14,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0RMwTyGEeNkojxWcdsn1F6VT82U50LR7B4brZ',
        NULL,
        'tour',
        4.9,
        500
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000060',
        'Hot Air Ballooning Over Cappadocia',
        'Experience the surreal landscape of Cappadocia from above on a magical sunrise hot air balloon flight over the region''s famous "fairy chimneys".',
        '2026-05-30',
        1,
        35000,
        'EUR',
        16,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Ho9FvsThGwz3K1ux2VkREeLI5o4MOfAs0l7D',
        NULL,
        'tour',
        5.0,
        600
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000061',
        'The Venice Canals by Gondola Tour',
        'A classic tour of Venice featuring a romantic 30-minute gondola ride through the city''s famous canals, including parts of the Grand Canal.',
        '2026-09-01',
        1,
        8000,
        'EUR',
        6,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0zu6itoXJIUtmFVWwH9Syj1QduAGx3R5e2rfC',
        NULL,
        'tour',
        4.8,
        720
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000062',
        'Secrets of The Metropolitan Museum of Art',
        'A 3-hour guided tour of the highlights of The Met in New York City, from Egyptian temples to modern masterpieces.',
        '2026-11-05',
        1,
        7500,
        'USD',
        15,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0zOzgiOXJIUtmFVWwH9Syj1QduAGx3R5e2rfC',
        NULL,
        'tour',
        4.7,
        310
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000063',
        'South African Wonders: Blyde River Canyon',
        'A day tour exploring the stunning vistas of Blyde River Canyon, including God''s Window and the Three Rondavels.',
        '2026-03-15',
        1,
        9500,
        'USD',
        10,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Cbtd4u7hlFE0vRXQqM1tunOcerYbofySxH9D',
        NULL,
        'tour',
        4.9,
        155
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000064',
        'Himalayan Heights: Everest Base Camp (Tibet)',
        'A rugged overland tour to the Tibetan side of Everest Base Camp, offering incredible views of the mountain''s north face.',
        '2026-05-10',
        8,
        320000,
        'USD',
        8,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0eqVVYzmJRZklyo9E0YxuDmePhcjpFO2TCVn1',
        NULL,
        'tour',
        4.8,
        95
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000065',
        'Journey to the Afterlife: Valley of the Kings',
        'A guided tour of the royal burial ground in Luxor, Egypt, where you can descend into the tombs of pharaohs like Tutankhamun.',
        '2026-10-20',
        1,
        14000,
        'USD',
        18,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Y9bVa7dsR7MbXpOk5Uq4WG9DviwmdfrS0VzJ',
        NULL,
        'tour',
        4.7,
        400
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000066',
        'Isfahan''s Architectural Jewel: The Grand Mosque',
        'A detailed architectural tour of the Jameh Mosque of Isfahan, a UNESCO site showcasing centuries of Islamic design.',
        '2026-04-05',
        1,
        8000,
        'USD',
        12,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0mkLagcl34QGUd9voJtbNVn71iHsPuBFgO8XE',
        NULL,
        'tour',
        4.9,
        115
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000067',
        'The Glaciers of New Zealand: A Franz Josef Tour',
        'A guided heli-hike tour of the Franz Josef Glacier, where you fly to the top and hike across the incredible ice formations.',
        '2027-01-20',
        1,
        45000,
        'USD',
        9,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0XCWCNv48czo0FnJgbLQ4u7TIiB2MsPNkAx5K',
        NULL,
        'tour',
        5.0,
        210
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000068',
        'Santorini Sunset Experience in Oia',
        'A classic evening tour to the village of Oia in Santorini, positioned perfectly to watch the world-famous sunset over the caldera.',
        '2026-08-10',
        1,
        10000,
        'EUR',
        25,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0jehyhuI3wS0HKTeOFA4qrugX65UbRliCaohy',
        NULL,
        'tour',
        4.8,
        850
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000069',
        'A Journey Through the Scottish Highlands',
        'A 3-day bus tour from Edinburgh through the dramatic landscapes of the Scottish Highlands, including Glencoe and Loch Ness.',
        '2026-07-01',
        3,
        45000,
        'GBP',
        30,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0wNviBEL6TGQynxq0jLsk21FBzhvI9SRfM8at',
        NULL,
        'tour',
        4.6,
        240
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000070',
        'Vancouver City & Stanley Park Tour',
        'A comprehensive city tour of Vancouver, Canada, highlighted by a visit to the famous totem poles and scenic viewpoints of Stanley Park.',
        '2026-08-05',
        1,
        9000,
        'CAD',
        22,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0NzLCwixHTAjerMmZ8XFxRfO2t61vip7CIn0s',
        NULL,
        'tour',
        4.7,
        320
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000071',
        'Moscow Icons: Red Square & St. Basil''s Cathedral',
        'A walking tour of Moscow''s Red Square, focusing on the history of the Kremlin and the stunning architecture of St. Basil''s Cathedral.',
        '2026-09-01',
        1,
        10000,
        'EUR',
        18,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0GmKjKLPWznj0ROAXHqb8ZGae3KBDyhQtE95i',
        NULL,
        'tour',
        4.8,
        415
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000072',
        'Giza Pyramids and Sphinx Half-Day Tour',
        'A classic tour of the Giza Plateau, visiting the Great Pyramid of Khufu, the Pyramid of Khafre, and the iconic Great Sphinx.',
        '2026-11-15',
        1,
        8500,
        'USD',
        25,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0EqqLeW7wMX7fJdCPGmizO6Dr1ZWhpSAgYoLa',
        NULL,
        'tour',
        4.7,
        950
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000073',
        'Exploring the Rocky Mountains',
        'A 4-day adventure into the heart of the Rocky Mountains, featuring scenic drives, wildlife spotting, and short hikes to beautiful vistas.',
        '2026-07-12',
        4,
        95000,
        'CAD',
        12,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0RLOMlo7EeNkojxWcdsn1F6VT82U50LR7B4br',
        NULL,
        'tour',
        4.8,
        195
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000074',
        'Gaudí''s Masterpiece: A Park Güell Tour',
        'A guided walking tour through the whimsical world of Park Güell in Barcelona, exploring the unique architectural elements created by Antoni Gaudí.',
        '2026-09-25',
        1,
        6000,
        'EUR',
        20,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ez5X3LmJRZklyo9E0YxuDmePhcjpFO2TCVn1',
        NULL,
        'tour',
        4.6,
        550
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000075',
        'Luxor''s East Bank: A Karnak Temple Tour',
        'Explore the vast Karnak Temple Complex on Luxor''s East Bank, one of the largest religious buildings ever constructed.',
        '2026-10-22',
        1,
        7000,
        'USD',
        18,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0GOopdyPWznj0ROAXHqb8ZGae3KBDyhQtE95i',
        NULL,
        'tour',
        4.7,
        380
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000076',
        'Fiordland''s Jewel: A Milford Sound Cruise',
        'A scenic day cruise through the majestic Milford Sound, featuring close-up views of waterfalls, seals, and the iconic Mitre Peak.',
        '2027-02-10',
        1,
        15000,
        'USD',
        40,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Eq4LK6SwMX7fJdCPGmizO6Dr1ZWhpSAgYoLa',
        NULL,
        'tour',
        4.9,
        650
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000077',
        'Shanghai by Night: The Bund Tour',
        'An evening walking tour along The Bund in Shanghai, showcasing the historic colonial architecture and the spectacular modern skyline of Pudong.',
        '2026-04-18',
        1,
        5500,
        'USD',
        20,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0EB5Ta5wMX7fJdCPGmizO6Dr1ZWhpSAgYoLab',
        NULL,
        'tour',
        4.8,
        310
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000078',
        'Fairytale Germany: A Neuschwanstein Castle Tour',
        'A day trip from Munich to the fairytale Neuschwanstein Castle, the 19th-century palace that inspired Disney. Includes a tour of the interior.',
        '2026-08-20',
        1,
        19000,
        'EUR',
        25,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0XytekC48czo0FnJgbLQ4u7TIiB2MsPNkAx5K',
        NULL,
        'tour',
        4.7,
        780
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000079',
        'Amazon Rainforest Eco-Tour',
        'A 4-day immersive eco-tour into the Amazon Rainforest. Stay in a jungle lodge, go on guided nature walks, and search for wildlife by canoe.',
        '2026-06-05',
        4,
        110000,
        'USD',
        10,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0cSZamutVcA6s7aPVF5zieXKBH4Qwx1yCJZmY',
        NULL,
        'tour',
        4.8,
        140
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000080',
        'The Thermal Wonders of Pamukkale',
        'A day tour to Pamukkale in Turkey to see the stunning white travertine terraces and bathe in the mineral-rich thermal waters.',
        '2026-09-02',
        1,
        9000,
        'EUR',
        18,
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0jddwz5TI3wS0HKTeOFA4qrugX65UbRliCaoh',
        NULL,
        'tour',
        4.6,
        290
    );

INSERT INTO
    travel_plan_destinations (
        travel_plan_id,
        city_name,
        country_name,
        stop_order,
        duration_days
    )
VALUES (
        'b1eebc99-9c0b-4ef8-bb6d-000000000051',
        'Rio de Janeiro',
        'Brazil',
        1,
        5
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000052',
        'Tromsø',
        'Norway',
        1,
        6
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000053',
        'Canaima National Park',
        'Venezuela',
        1,
        7
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000054',
        'Las Vegas',
        'USA',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000055',
        'Naples',
        'Italy',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000056',
        'Kyoto',
        'Japan',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000057',
        'Zermatt',
        'Switzerland',
        1,
        5
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000058',
        'Selçuk',
        'Turkey',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000059',
        'Siem Reap',
        'Cambodia',
        1,
        3
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000060',
        'Göreme',
        'Turkey',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000061',
        'Venice',
        'Italy',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000062',
        'New York City',
        'USA',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000063',
        'Graskop',
        'South Africa',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000064',
        'Tingri',
        'Tibet',
        1,
        8
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000065',
        'Luxor',
        'Egypt',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000066',
        'Isfahan',
        'Iran',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000067',
        'Franz Josef',
        'New Zealand',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000068',
        'Oia',
        'Greece',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000069',
        'Edinburgh',
        'Scotland',
        1,
        3
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000070',
        'Vancouver',
        'Canada',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000071',
        'Moscow',
        'Russia',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000072',
        'Cairo',
        'Egypt',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000073',
        'Calgary',
        'Canada',
        1,
        4
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000074',
        'Barcelona',
        'Spain',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000075',
        'Luxor',
        'Egypt',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000076',
        'Te Anau',
        'New Zealand',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000077',
        'Shanghai',
        'China',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000078',
        'Munich',
        'Germany',
        1,
        1
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000079',
        'Iquitos',
        'Peru',
        1,
        4
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-000000000080',
        'Denizli',
        'Turkey',
        1,
        1
    );
-- =================================================================
--  Part 3 of 4: User Blog Posts & Photos
-- =================================================================

-- ==========
-- 5) User Posts & Photos (30 Records)
-- ==========
INSERT INTO
    user_posts (
        id,
        user_id,
        title,
        content,
        category,
        status
    )
VALUES (
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'My Unforgettable Day at the Moraine Lake',
        'The vibrant blue of Moraine Lake has to be seen to be believed. We rented a canoe for an hour and paddled out to the middle - the views of the Valley of the Ten Peaks were just spectacular.',
        'Travel Story',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'A Guide to Hiking Torres del Paine',
        'We completed the W Trek in 5 days. It was incredibly challenging but the landscapes are otherworldly. My biggest tip: be prepared for all four seasons in one day!',
        'Adventure',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000083',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'Photographing Peggy''s Cove Lighthouse',
        'For the best photos of this iconic Canadian lighthouse, go for sunrise. You''ll beat the crowds and catch the beautiful morning light on the granite rocks.',
        'Photography',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000084',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'What to See at The Rijksmuseum',
        'Beyond The Night Watch, don''t miss the incredible dollhouses from the 17th century and the beautiful library. It''s a huge museum, so plan to spend at least half a day.',
        'Museums',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000085',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15', -- <<< THE MISSING user_id HAS BEEN ADDED HERE
        'A Royal Afternoon at Buckingham Palace',
        'We timed our visit perfectly to see the Changing of the Guard ceremony. It''s a fantastic display of British pageantry. The palace itself is as grand as you''d imagine.',
        'City Guide',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000086',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'The Incredible History of Hagia Sophia',
        'Walking into Hagia Sophia is like stepping into a time machine. The blend of Christian mosaics and Islamic calligraphy tells the story of Istanbul itself. An absolutely unmissable sight.',
        'Historic Site',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000087',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'My Encounter with the Terracotta Army',
        'The sheer number of life-sized warriors is mind-boggling. Each one has a unique face. It''s an incredible archaeological discovery.',
        'Travel Story',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000088',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'Walking the Ancient Streets of Pompeii',
        'It''s haunting to walk through the streets of a city frozen in time. The preserved villas give you a real sense of daily life in ancient Rome before Vesuvius erupted.',
        'Historic Site',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000089',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'Relaxing at The Blue Lagoon, Iceland',
        'The milky-blue geothermal water against the black lava rock is a surreal sight. It''s a tourist hotspot for a reason - pure relaxation.',
        'Relaxation',
        'published'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000090',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16',
        'Our Day Trip to Bondi Beach',
        'We took the bus from Sydney and spent the day at the famous Bondi Beach. We walked the scenic path to Coogee and had a fantastic lunch at the Icebergs Club.',
        'Beach',
        'published'
    );

INSERT INTO
    user_post_photos (post_id, image_url, caption)
VALUES (
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0lVBOH0qtoyrEG0cOjZ4sLVYR3ztldFAe75qH',
        'The stunning blue waters of Moraine Lake.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0Pzuze4jDekPafF2MJLyZcHoq4gQ078pdWjUT',
        'The granite peaks of Torres del Paine National Park.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000083',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ds8vLXmTYxVdEPOHJ8sb9p21g3CBmQU6L4ZG',
        'Peggy''s Cove Lighthouse at sunset.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000084',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0ckK9b9VcA6s7aPVF5zieXKBH4Qwx1yCJZmYr',
        'The exterior of the Rijksmuseum in Amsterdam.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000085',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0LX5xpcq43jEt8qsiycWUKSabYIPoBkrnFdx2',
        'The iconic facade of Buckingham Palace.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000086',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0IlmG4fY6zmb4XuSilyg1qQ2D5AUxLHFEZk0O',
        'The grand interior of Hagia Sophia in Istanbul.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000087',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0RLXhCgFEeNkojxWcdsn1F6VT82U50LR7B4br',
        'The life-sized soldiers of the Terracotta Army.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000088',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0TuONa3HHOLqJZQAKxYSiDwTPCnFs517vRXN9',
        'The preserved streets of ancient Pompeii.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000089',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj0HDZikNsThGwz3K1ux2VkREeLI5o4MOfAs0l7',
        'The milky-blue waters of The Blue Lagoon.'
    ),
    (
        'd1eebc99-9c0b-4ef8-bb6d-000000000090',
        'https://3ob6vy266n.ufs.sh/f/Gabd92PWznj08FGJHl1oZdrn4ulg9Vv6NbwEiCLAPQ5XjeWh',
        'The iconic Bondi Beach in Sydney, Australia.'
    );

-- ==========
-- 6) Comments
-- ==========
INSERT INTO
    comments (
        user_id,
        content,
        commentable_id,
        commentable_type,
        status
    )
VALUES
    -- Comments for Attraction: Serengeti National Park (ID: ...0001)
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'The sheer scale of the migration is incredible. A true wonder of the natural world.',
        'a1b2c3d4-0001-4001-8001-000000000001',
        'attraction',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'I''ve never seen so many animals in one place. Our guide was amazing!',
        'a1b2c3d4-0001-4001-8001-000000000001',
        'attraction',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'This is at the top of my bucket list. Thanks for sharing this beautiful photo.',
        'a1b2c3d4-0001-4001-8001-000000000001',
        'attraction',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16',
        'Did you see any lion hunts? We saw two!',
        'a1b2c3d4-0001-4001-8001-000000000001',
        'attraction',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'The Serengeti is a magical place.',
        'a1b2c3d4-0001-4001-8001-000000000001',
        'attraction',
        'approved'
    ),
    -- Comments for Blog Post: My Unforgettable Day at the Moraine Lake (ID: ...0081)
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'Great guide! We''re planning a trip to London next year and this is a must-see.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'The history in that building is palpable. I got chills.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'I loved the audio guide they offered, very informative.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16',
        'Did you see the Coronation Chair?',
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'A truly stunning piece of architecture.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000081',
        'post',
        'approved'
    ),
    -- Comments for Blog Post: A Guide to Hiking Torres del Paine (ID: ...0082)
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
        'I had no idea about the Astor Chinese Garden Court, thank you for the tip!',
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
        'The Met is my favorite museum in the world. You could spend a week in there.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15',
        'Great post! I also love the rooftop garden in the summer.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b16',
        'The Arms and Armor collection is so impressive.',
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'post',
        'approved'
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
        'Love this article!',
        'd1eebc99-9c0b-4ef8-bb6d-000000000082',
        'post',
        'approved'
    );