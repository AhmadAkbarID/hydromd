const axios = require('axios')
const fs = require('fs')
const path = require('path')

const baseUrl = 'https://www.rumahotp.com/api'
const dbDir = path.join(__dirname, '../database')
const dbPath = path.join(dbDir, 'rumahotp.json')
const pendingPath = path.join(dbDir, 'rumahotp_pending.json')

const servicesList = [
    { id: 14, name: "WhatsApp" }, { id: 5, name: "Telegram" }, { id: 4, name: "Instagram" }, { id: 1, name: "KakaoTalk" }, 
    { id: 1283, name: "Qpon" }, { id: 129316, name: "myXL" }, { id: 255, name: "Ovo" }, { id: 104, name: "DANA" }, 
    { id: 9, name: "Facebook" }, { id: 118, name: "Gojek" }, { id: 855, name: "YouDo" }, { id: 863, name: "Велобайк" }, 
    { id: 862, name: "Amway" }, { id: 861, name: "Шоколадница" }, { id: 860, name: "ТОКИО-CITY" }, { id: 859, name: "BusyFly" }, 
    { id: 858, name: "Профи" }, { id: 857, name: "Cian" }, { id: 856, name: "Boosty" }, { id: 865, name: "Аптека Апрель" }, 
    { id: 854, name: "Radium" }, { id: 853, name: "Sunlight" }, { id: 852, name: "SOKOLOV" }, { id: 851, name: "Namars" }, 
    { id: 850, name: "Утконос" }, { id: 849, name: "Gpnbonus" }, { id: 848, name: "Beboo" }, { id: 847, name: "TamTam" }, 
    { id: 873, name: "ВсеИнструменты" }, { id: 882, name: "Kia" }, { id: 881, name: "Кузбасс Онлайн" }, { id: 880, name: "Bitrue" }, 
    { id: 879, name: "Рив Гош" }, { id: 878, name: "BRO" }, { id: 877, name: "Maxim" }, { id: 875, name: "Uralairlines" }, 
    { id: 874, name: "Джилекс" }, { id: 846, name: "Bunq" }, { id: 872, name: "VFS GLOBAL" }, { id: 871, name: "KION" }, 
    { id: 870, name: "Vsesmart" }, { id: 869, name: "CDEK" }, { id: 868, name: "Золотое Яблоко" }, { id: 867, name: "EnerGO" }, 
    { id: 866, name: "Autoru" }, { id: 820, name: "QwikCilver" }, { id: 828, name: "RummyCircle" }, { id: 827, name: "Zepto" }, 
    { id: 826, name: "Frizza" }, { id: 825, name: "Marwadi" }, { id: 824, name: "PoshVine" }, { id: 823, name: "A23" }, 
    { id: 822, name: "CityMall" }, { id: 821, name: "Tata CLiQ Palette" }, { id: 829, name: "Khatabook" }, { id: 819, name: "CollabAct" }, 
    { id: 818, name: "Winter Loan" }, { id: 817, name: "Tata Neu" }, { id: 816, name: "Playerzpot" }, { id: 815, name: "JioMart" }, 
    { id: 814, name: "BharatPe" }, { id: 813, name: "Pinduoduo" }, { id: 837, name: "Bajaj Finserv" }, { id: 845, name: "Anibis" }, 
    { id: 844, name: "Bearwww" }, { id: 843, name: "Tomato" }, { id: 842, name: "Kamatera" }, { id: 841, name: "Hinge Dating" }, 
    { id: 840, name: "MockGuru" }, { id: 839, name: "Angel One" }, { id: 838, name: "Yonogames" }, { id: 883, name: "Фотострана" }, 
    { id: 836, name: "Hdfcbank" }, { id: 835, name: "Servify" }, { id: 834, name: "Roomster" }, { id: 833, name: "SKCAPITAL" }, 
    { id: 832, name: "BankKaro" }, { id: 831, name: "FitCredit" }, { id: 830, name: "EarnEasy" }, { id: 926, name: "AR Lens" }, 
    { id: 934, name: "Fugeelah" }, { id: 933, name: "MeiQFashion" }, { id: 932, name: "Myboost" }, { id: 931, name: "Maybank" }, 
    { id: 930, name: "Tanoti" }, { id: 929, name: "GoPayz" }, { id: 928, name: "Suntec" }, { id: 927, name: "BonusLink" }, 
    { id: 935, name: "K11" }, { id: 925, name: "CheckDomain" }, { id: 924, name: "Surveybell" }, { id: 923, name: "1and1" }, 
    { id: 922, name: "Strato" }, { id: 921, name: "WEBDE" }, { id: 920, name: "GMX" }, { id: 919, name: "Abbott" }, 
    { id: 918, name: "OneForma" }, { id: 943, name: "Packeta" }, { id: 951, name: "Redigame" }, { id: 950, name: "AstraPay" }, 
    { id: 949, name: "Cloud Manager" }, { id: 948, name: "BCA Syariah" }, { id: 947, name: "BPJSTK" }, { id: 946, name: "Zasilkovna" }, 
    { id: 945, name: "Betano" }, { id: 944, name: "Publi24" }, { id: 917, name: "Meitu" }, { id: 942, name: "Seznam" }, 
    { id: 941, name: "OpenPhone" }, { id: 940, name: "Willhaben" }, { id: 939, name: "ArenaPlus" }, { id: 938, name: "Prime Opinion" }, 
    { id: 937, name: "Marktplaats" }, { id: 936, name: "Striving in the Lion City" }, { id: 891, name: "Fups" }, { id: 899, name: "Meituan" }, 
    { id: 898, name: "Privy" }, { id: 897, name: "BytePlus" }, { id: 896, name: "Boyaa" }, { id: 895, name: "Alchemy" }, 
    { id: 894, name: "XXGame" }, { id: 893, name: "Chevron" }, { id: 892, name: "PlayerAuctions" }, { id: 900, name: "Pockit" }, 
    { id: 890, name: "Ozan" }, { id: 889, name: "NEQUI" }, { id: 888, name: "Cabify" }, { id: 887, name: "Rappi" }, 
    { id: 886, name: "Netease" }, { id: 885, name: "Aya Bank" }, { id: 884, name: "Royal Canin" }, { id: 908, name: "TRUTH SOCIAL" }, 
    { id: 916, name: "MTR Mobile" }, { id: 915, name: "Grailed" }, { id: 914, name: "VIMpay" }, { id: 913, name: "Klarna" }, 
    { id: 912, name: "Tuul" }, { id: 911, name: "Neocrypto" }, { id: 910, name: "JinJiang" }, { id: 909, name: "PlayOJO" }, 
    { id: 812, name: "Ipsos iSay" }, { id: 907, name: "Airtime" }, { id: 906, name: "Haleon" }, { id: 905, name: "Friendtech" }, 
    { id: 904, name: "Foodora" }, { id: 903, name: "Taptap Send" }, { id: 902, name: "RockeTreach" }, { id: 901, name: "Tiptapp" }, 
    { id: 713, name: "Full rent" }, { id: 721, name: "Douyu" }, { id: 720, name: "Huya" }, { id: 719, name: "Megogo" }, 
    { id: 718, name: "Airtel" }, { id: 717, name: "Ximalaya" }, { id: 716, name: "My11Circle" }, { id: 715, name: "1xbet" }, 
    { id: 714, name: "DewuPoison" }, { id: 722, name: "Olacabs" }, { id: 712, name: "Qoo10" }, { id: 711, name: "Ticketmaster" }, 
    { id: 710, name: "Trendyol" }, { id: 709, name: "ЗдравСити" }, { id: 708, name: "Zomato" }, { id: 707, name: "iQIYI" }, 
    { id: 706, name: "Mocospace" }, { id: 705, name: "Hopi" }, { id: 730, name: "Delivery Club" }, { id: 738, name: "EasyPay" }, 
    { id: 737, name: "MEGA" }, { id: 736, name: "Trip" }, { id: 735, name: "Лэтуаль" }, { id: 734, name: "Pivko24" }, 
    { id: 733, name: "LUKOIL-AZS" }, { id: 732, name: "CourseHero" }, { id: 731, name: "mosru" }, { id: 704, name: "Urent" }, 
    { id: 729, name: "IFood" }, { id: 728, name: "YouStar" }, { id: 727, name: "Wink" }, { id: 726, name: "Switips" }, 
    { id: 725, name: "TenChat" }, { id: 724, name: "WinzoGame" }, { id: 723, name: "Dominos Pizza" }, { id: 678, name: "CityBase" }, 
    { id: 686, name: "EscapeFromTarkov" }, { id: 685, name: "UU163" }, { id: 684, name: "Glovo" }, { id: 683, name: "Wondermart" }, 
    { id: 682, name: "Perfluence" }, { id: 681, name: "Haraj" }, { id: 680, name: "CrefisaMais" }, { id: 679, name: "Ruten" }, 
    { id: 687, name: "GalaxyWin" }, { id: 677, name: "LazyPay" }, { id: 676, name: "GCash" }, { id: 675, name: "СберМегаМаркет" }, 
    { id: 674, name: "MIXMART" }, { id: 673, name: "Uteka" }, { id: 672, name: "勇仕网络Ys4fun" }, { id: 671, name: "Вита экспресс" }, 
    { id: 695, name: "Эльдорадо" }, { id: 703, name: "99app" }, { id: 702, name: "Taikang" }, { id: 701, name: "CELEBe" }, 
    { id: 700, name: "DoorDash" }, { id: 699, name: "LYKA" }, { id: 698, name: "HQ Trivia" }, { id: 697, name: "Twilio" }, 
    { id: 696, name: "Quipp" }, { id: 739, name: "NimoTV" }, { id: 694, name: "YandexGo" }, { id: 693, name: "Ininal" }, 
    { id: 692, name: "Alfagift" }, { id: 691, name: "Детский мир" }, { id: 690, name: "Около" }, { id: 689, name: "Probo" }, 
    { id: 688, name: "Iti" }, { id: 786, name: "PrivetMir" }, { id: 794, name: "FortunaSK" }, { id: 793, name: "Walmart" }, 
    { id: 792, name: "Miravia" }, { id: 791, name: "Hh" }, { id: 790, name: "ZaleyCash" }, { id: 789, name: "SynotTip" }, 
    { id: 788, name: "УлыбкаРадуги" }, { id: 787, name: "Yami" }, { id: 795, name: "FreeNow" }, { id: 785, name: "Банки" }, 
    { id: 784, name: "MonetaRu" }, { id: 783, name: "Notifire" }, { id: 781, name: "Any Other" }, { id: 780, name: "Smiles" }, 
    { id: 779, name: "GoChat" }, { id: 778, name: "Rakuten" }, { id: 803, name: "Emenu" }, { id: 811, name: "CMB" }, 
    { id: 810, name: "Uzum" }, { id: 809, name: "Universal Beijing Resort" }, { id: 808, name: "Flowwow" }, 
    { id: 807, name: "Siberian Wellness" }, { id: 806, name: "Aviata.kz" }, { id: 805, name: "MYCAR.KZ" }, { id: 804, name: "Naimi.kz" }, 
    { id: 775, name: "CasinoPlus" }, { id: 802, name: "Claude" }, { id: 801, name: "Beanfun" }, { id: 800, name: "Таксовичкоф" }, 
    { id: 799, name: "Upwork" }, { id: 798, name: "Indodax" }, { id: 797, name: "MotorkuX" }, { id: 796, name: "Shpock" }, 
    { id: 747, name: "Hepsiburadacom" }, { id: 756, name: "Wise" }, { id: 755, name: "Moneylion" }, { id: 754, name: "Citymobil" }, 
    { id: 753, name: "Stoloto" }, { id: 752, name: "Tosla" }, { id: 750, name: "Lamoda" }, { id: 749, name: "Zupee" }, 
    { id: 748, name: "Okko" }, { id: 757, name: "CallApp" }, { id: 746, name: "GoFundMe" }, { id: 745, name: "Inboxlv" }, 
    { id: 744, name: "premium.one" }, { id: 743, name: "Mercari" }, { id: 742, name: "Happn" }, { id: 741, name: "Astropay" }, 
    { id: 740, name: "CAIXA" }, { id: 766, name: "Karusel" }, { id: 774, name: "Chalkboard" }, { id: 773, name: "Likee" }, 
    { id: 772, name: "LoveLocal" }, { id: 771, name: "Subito" }, { id: 770, name: "Baidu" }, { id: 769, name: "Ашан" }, 
    { id: 768, name: "Expressmoney" }, { id: 767, name: "KuCoinPlay" }, { id: 952, name: "Allofresh" }, { id: 765, name: "Tatneft" }, 
    { id: 764, name: "ShellBox" }, { id: 762, name: "Вкусно и Точка" }, { id: 761, name: "Dream11" }, { id: 760, name: "YAPPY" }, 
    { id: 759, name: "Xiaomi" }, { id: 758, name: "Faceit" }, { id: 1218, name: "OLXpt" }, { id: 1227, name: "51exch" }, 
    { id: 1226, name: "Magicpin" }, { id: 1225, name: "Swarail" }, { id: 1224, name: "Stan" }, { id: 1223, name: "Unstop" }, 
    { id: 1222, name: "Streamlabs" }, { id: 1220, name: "OLXuz" }, { id: 1219, name: "GitHub" }, { id: 1228, name: "Truemoney" }, 
    { id: 1217, name: "OLXbg" }, { id: 1216, name: "OLXro" }, { id: 1215, name: "Etsy" }, { id: 1214, name: "Talkatone" }, 
    { id: 1213, name: "OLXpl" }, { id: 1212, name: "OLXua" }, { id: 1211, name: "OLXkz" }, { id: 1209, name: "Loloo" }, 
    { id: 1236, name: "Rapido" }, { id: 1244, name: "Kudos" }, { id: 1243, name: "TrapCall" }, { id: 1242, name: "Gaintplay" }, 
    { id: 1241, name: "Credit Karma" }, { id: 1240, name: "College Pulse" }, { id: 1239, name: "Shopsy" }, 
    { id: 1238, name: "Omnicard" }, { id: 1237, name: "Sixer" }, { id: 1208, name: "DNS" }, { id: 1235, name: "Efsane" }, 
    { id: 1234, name: "Bingo101" }, { id: 1233, name: "Capital One" }, { id: 1232, name: "Saathi" }, { id: 1231, name: "Vision11" }, 
    { id: 1230, name: "Hypermart" }, { id: 1229, name: "Innopay" }, { id: 1180, name: "Radquest" }, { id: 1189, name: "Tealive" }, 
    { id: 1188, name: "BETININ" }, { id: 1187, name: "Goa games" }, { id: 1186, name: "Verasight" }, { id: 1184, name: "match.com" }, 
    { id: 1183, name: "ConfirmTkt" }, { id: 1182, name: "ludoplus" }, { id: 1181, name: "Hicard" }, { id: 1190, name: "Busqo" }, 
    { id: 1179, name: "Poker Circle" }, { id: 1178, name: "Branch" }, { id: 1177, name: "Bingoplus" }, { id: 1176, name: "Getsbet" }, 
    { id: 1173, name: "Media express" }, { id: 1166, name: "СушиMake" }, { id: 1165, name: "Fastwin" }, { id: 1198, name: "HDFC Egro" }, 
    { id: 1206, name: "HPGas" }, { id: 1205, name: "Talabat" }, { id: 1204, name: "Tune studio" }, { id: 1203, name: "theAsianparent" }, 
    { id: 1202, name: "ding" }, { id: 1201, name: "Benjamin" }, { id: 1200, name: "fivesurveys" }, { id: 1199, name: "Tomoro Coffee" }, 
    { id: 1245, name: "Resy" }, { id: 1197, name: "Keeta" }, { id: 1196, name: "Happypancake" }, { id: 1195, name: "Taj Rummy" }, 
    { id: 1194, name: "Namaskar" }, { id: 1193, name: "Narendra modi" }, { id: 1192, name: "meta.ua" }, { id: 1191, name: "Nuum.ru" }, 
    { id: 1288, name: "Instamatch" }, { id: 1298, name: "Cursor" }, { id: 1295, name: "Skills" }, { id: 1294, name: "汇旺 Huione Pay" }, 
    { id: 1293, name: "Paisabazaar" }, { id: 1292, name: "Roz Rummy" }, { id: 1291, name: "Nykaa" }, { id: 1290, name: "Truemeds" }, 
    { id: 1289, name: "Ludo11" }, { id: 1299, name: "Aws" }, { id: 1287, name: "Atlas Earth" }, { id: 1286, name: "SpinWinner" }, 
    { id: 1285, name: "Playkaro247" }, { id: 1284, name: "Starexch" }, { id: 1282, name: "DocuSign" }, { id: 1281, name: "RedNote / Xiaohongshu" }, 
    { id: 1307, name: "Winmatch" }, { id: 129002, name: "Kredito" }, { id: 129001, name: "Credinex" }, { id: 129000, name: "XM Broker" }, 
    { id: 128999, name: "Fore Coffee" }, { id: 128998, name: "myIM3" }, { id: 1309, name: "Wells Fargo" }, { id: 1308, name: "Chipotle" }, 
    { id: 1280, name: "GetHoldings" }, { id: 1306, name: "Google Chat" }, { id: 1305, name: "BigBasket" }, { id: 1304, name: "500px" }, 
    { id: 1303, name: "Quoka" }, { id: 1302, name: "Royaljeet" }, { id: 1301, name: "Cricbuzz" }, { id: 1300, name: "Goldsbet" }, 
    { id: 1253, name: "3Fun" }, { id: 1262, name: "Tumblr" }, { id: 1261, name: "Дикси" }, { id: 1260, name: "Pelago" }, 
    { id: 1259, name: "Taimi" }, { id: 1258, name: "Ring4" }, { id: 1257, name: "Aspiration" }, { id: 1255, name: "Acima" }, 
    { id: 1254, name: "Ibotta" }, { id: 1263, name: "Audible" }, { id: 1252, name: "CenturyLink" }, { id: 1251, name: "Dutch Bros" }, 
    { id: 1250, name: "Chase" }, { id: 1249, name: "Juno" }, { id: 1248, name: "Sideline" }, { id: 1247, name: "Timewall" }, 
    { id: 1246, name: "Blastbucks" }, { id: 1271, name: "Reddit" }, { id: 1279, name: "Dave" }, { id: 1278, name: "SeatGeek" }, 
    { id: 1277, name: "Zillow" }, { id: 1276, name: "BridgeMoney" }, { id: 1275, name: "TurboTenant" }, { id: 1274, name: "Courtyard" }, 
    { id: 1273, name: "Outlier" }, { id: 1272, name: "Winclash" }, { id: 1164, name: "Google Messenger" }, { id: 1270, name: "MMLive" }, 
    { id: 1269, name: "Wallapop" }, { id: 1268, name: "RummyYes" }, { id: 1267, name: "FMCPay" }, { id: 1266, name: "Bosslike" }, 
    { id: 1265, name: "SerpApi" }, { id: 1264, name: "RapidApi" }, { id: 995, name: "Ollis" }, { id: 1003, name: "Gener8" }, 
    { id: 1002, name: "Rebtel" }, { id: 1001, name: "WAUG" }, { id: 1000, name: "Fortumo" }, { id: 999, name: "IPanelOnline" }, 
    { id: 998, name: "CupidMedia" }, { id: 997, name: "G2A" }, { id: 996, name: "Bankera" }, { id: 1004, name: "Gopuff" }, 
    { id: 994, name: "Город" }, { id: 993, name: "Av100pro" }, { id: 992, name: "МИГРАНТ СЕРВИС" }, { id: 991, name: "Почта России" }, 
    { id: 990, name: "Бери заряд" }, { id: 989, name: "Brevo" }, { id: 988, name: "Nloto" }, { id: 987, name: "СушиВёсла" }, 
    { id: 1012, name: "AsiaMiles" }, { id: 1020, name: "All Access" }, { id: 1019, name: "Kemnaker RI" }, { id: 1018, name: "INDOBA" }, 
    { id: 1017, name: "ShareParty" }, { id: 1016, name: "Daya Auto" }, { id: 1015, name: "GetPlus" }, { id: 1014, name: "Boku" }, 
    { id: 1013, name: "MyValue" }, { id: 986, name: "SpaceWeb" }, { id: 1011, name: "Venteny" }, { id: 1010, name: "Prakerja" }, 
    { id: 1009, name: "Move It" }, { id: 1008, name: "CoffeeTea" }, { id: 1007, name: " Zoo Game" }, { id: 1006, name: "ZUS Coffee" }, 
    { id: 1005, name: " Feels" }, { id: 960, name: "Astra Otoshop" }, { id: 968, name: "AfreecaTV" }, { id: 967, name: "SEEDS" }, 
    { id: 966, name: "PizzaHut" }, { id: 965, name: "UangMe" }, { id: 964, name: "Ubisoft" }, { id: 963, name: "Jiva Petani" }, 
    { id: 962, name: "Flik" }, { id: 961, name: "Gamesofa" }, { id: 969, name: "TipTip" }, { id: 959, name: "Bunda" }, 
    { id: 958, name: "Neon" }, { id: 957, name: "Flip" }, { id: 956, name: "TheFork" }, { id: 955, name: "Greywoods" }, 
    { id: 954, name: "Godrej" }, { id: 953, name: "ONBUKA" }, { id: 977, name: "Coca-Cola" }, { id: 985, name: "Fliff" }, 
    { id: 984, name: "SmartyPig" }, { id: 983, name: "Zach Bryan" }, { id: 982, name: "Razer" }, { id: 981, name: "Tiv" }, 
    { id: 980, name: "Spark Driver" }, { id: 979, name: "Couponscom" }, { id: 978, name: "Kaching" }, { id: 1021, name: "MotionPay" }, 
    { id: 976, name: "Njuškalo" }, { id: 975, name: "This Fate" }, { id: 974, name: "Baihe" }, { id: 973, name: "Daki" }, 
    { id: 972, name: " LuckyLand Slots" }, { id: 971, name: "FeetFinder" }, { id: 970, name: "Schibsted" }, { id: 1077, name: "Vercel" }, 
    { id: 1091, name: "Punjab citizen" }, { id: 1085, name: "Bebeclub" }, { id: 1084, name: "NutriClub" }, { id: 1083, name: "Vida" }, 
    { id: 1082, name: "BC Game" }, { id: 1081, name: "Segari" }, { id: 1080, name: "Smart" }, { id: 1079, name: "Discover Hong Kong" }, 
    { id: 1092, name: "Constitutioner" }, { id: 1076, name: "WooPlus" }, { id: 1075, name: "SBI Card" }, { id: 1074, name: "Acko" }, 
    { id: 1072, name: "华人街" }, { id: 1070, name: "Battlestate Games" }, { id: 1069, name: "Pcipay" }, { id: 1068, name: "Womply" }, 
    { id: 1133, name: "CoinFantasy" }, { id: 1163, name: "Yuda" }, { id: 1162, name: "Sonol" }, { id: 1161, name: "OpenBudjet" }, 
    { id: 1160, name: "Satu" }, { id: 1158, name: "Yellow" }, { id: 1156, name: "Xbox" }, { id: 1150, name: "Migros" }, 
    { id: 1141, name: "PYYPL" }, { id: 1065, name: "Greggs " }, { id: 1117, name: "VARUS" }, { id: 1116, name: "Supercell" }, 
    { id: 1115, name: "Shein" }, { id: 1111, name: "Moneyview" }, { id: 1108, name: "MitID" }, { id: 1107, name: "GORDAN" }, 
    { id: 1106, name: "TEAMORU" }, { id: 1038, name: "Voi" }, { id: 1046, name: "LOTTE Mart" }, { id: 1045, name: "DOKU" }, 
    { id: 1044, name: "Dagangan" }, { id: 1043, name: "Easycash" }, { id: 1042, name: "Tiketcom" }, { id: 1041, name: "Prenagen Club" }, 
    { id: 1040, name: "Hanya" }, { id: 1039, name: "Sony LIV" }, { id: 1047, name: "Chakra Rewards" }, { id: 1037, name: "Blank Street" }, 
    { id: 1036, name: "Her" }, { id: 1035, name: "Ryde" }, { id: 1034, name: "WINDS" }, { id: 1033, name: "Book My Play" }, 
    { id: 1032, name: "LEROY MERLIN" }, { id: 1022, name: "LinkAja" }, { id: 1055, name: "Muzz" }, { id: 1064, name: "TIER" }, 
    { id: 1062, name: "Remotasks" }, { id: 1061, name: "GetResponse" }, { id: 1060, name: "Lion Parcel" }, { id: 1059, name: "Paybis" }, 
    { id: 1058, name: "Nice88" }, { id: 1057, name: "Profee" }, { id: 1056, name: "Ankama" }, { id: 670, name: "G2G" }, 
    { id: 1054, name: "Lydia" }, { id: 1053, name: "DIKIDI" }, { id: 1052, name: "Gurmanika" }, { id: 1051, name: "Mera Gaon" }, 
    { id: 1050, name: "StockyDodo" }, { id: 1049, name: "GOMOFY" }, { id: 1048, name: "Xworldwallet" }, { id: 283, name: "Sorare" }, 
    { id: 292, name: "Yemeksepeti" }, { id: 291, name: "Lidl" }, { id: 290, name: "Bumble" }, { id: 289, name: "Clubhouse" }, 
    { id: 288, name: "RedBook" }, { id: 286, name: "FotoCasa" }, { id: 285, name: "Idealista" }, { id: 284, name: "Author24" }, 
    { id: 293, name: "Immowelt" }, { id: 282, name: "Consultant" }, { id: 281, name: "Rbt" }, { id: 280, name: "SticPay" }, 
    { id: 279, name: "Br777" }, { id: 277, name: "GiraBank" }, { id: 276, name: "Celcoin" }, { id: 275, name: "MyLavash" }, 
    { id: 274, name: "CashApp" }, { id: 301, name: "Potato" }, { id: 309, name: "ZCity" }, { id: 308, name: "Amasia" }, 
    { id: 307, name: "MapleSEA" }, { id: 306, name: "GoerliFaucet" }, { id: 305, name: "Hermes" }, { id: 304, name: "Grab" }, 
    { id: 303, name: "icq" }, { id: 302, name: "Paxful" }, { id: 273, name: "Chispa" }, { id: 300, name: "Zoho" }, 
    { id: 299, name: "Joyride" }, { id: 298, name: "Wish" }, { id: 297, name: "Tango" }, { id: 296, name: "Keybase" }, 
    { id: 295, name: "Wolt" }, { id: 294, name: "Linode" }, { id: 246, name: "TanTan" }, { id: 254, name: "Lazada" }, 
    { id: 253, name: "Hezzl" }, { id: 252, name: "Gett" }, { id: 251, name: "Bolt" }, { id: 250, name: "Bitclout" }, 
    { id: 249, name: "Monese" }, { id: 248, name: "Getir" }, { id: 247, name: "OpenAI (ChatGPT)" }, { id: 240, name: "Hinge" }, 
    { id: 236, name: "Dundle" }, { id: 235, name: "Snapchat" }, { id: 233, name: "Skype" }, { id: 226, name: "Bigo Live" }, 
    { id: 215, name: "Ozon" }, { id: 207, name: "LinkedIn" }, { id: 264, name: "Dhani" }, { id: 272, name: "CashKaro" }, 
    { id: 271, name: "Fiverr" }, { id: 270, name: "Venmo" }, { id: 269, name: "Leboncoin" }, { id: 268, name: "GoogleVoice" }, 
    { id: 267, name: "СберЧаевые" }, { id: 266, name: "Indomaret" }, { id: 265, name: "1688" }, { id: 310, name: "Bilibili" }, 
    { id: 263, name: "Taobao" }, { id: 262, name: "Skout" }, { id: 261, name: "DENT" }, { id: 259, name: "Poshmark" }, 
    { id: 258, name: "Zalo" }, { id: 257, name: "Truecaller" }, { id: 256, name: "Seo Sprint" }, { id: 355, name: "IZI" }, 
    { id: 363, name: "HeyBox" }, { id: 362, name: "Meta" }, { id: 361, name: "Mobile01" }, { id: 360, name: "YouGotaGift" }, 
    { id: 359, name: "GameArena" }, { id: 358, name: "Parkplus" }, { id: 357, name: "163СOM" }, { id: 356, name: "Leboncoin1" }, 
    { id: 364, name: "CoinField" }, { id: 354, name: "AIS" }, { id: 353, name: "BIP" }, { id: 352, name: "FoxFord" }, 
    { id: 351, name: "RummyOla" }, { id: 350, name: "GalaxyChat" }, { id: 349, name: "InFund" }, { id: 348, name: "Wmaraci" }, 
    { id: 373, name: "Кораблик" }, { id: 381, name: "IRCTC" }, { id: 380, name: "Энергобум" }, { id: 379, name: "BinBin" }, 
    { id: 378, name: "Kirana" }, { id: 377, name: "Домовой" }, { id: 376, name: "Meliuz" }, { id: 375, name: "OffGamers" }, 
    { id: 374, name: "SportGully" }, { id: 347, name: "Familia" }, { id: 372, name: "Banqi" }, { id: 370, name: "Q12 Trivia" }, 
    { id: 369, name: "Штолле" }, { id: 368, name: "Ортека" }, { id: 367, name: "Yaay" }, { id: 366, name: "Brand20ua" }, 
    { id: 365, name: "LadyMaria" }, { id: 321, name: "Nttgame" }, { id: 329, name: "ROBINHOOD" }, { id: 328, name: "OfferUp" }, 
    { id: 327, name: "Biedronka" }, { id: 326, name: "IndiaPlays" }, { id: 325, name: "Budweiser" }, { id: 324, name: "BigC" }, 
    { id: 323, name: "Digikala" }, { id: 322, name: "Quack" }, { id: 330, name: "Setel" }, { id: 319, name: "Carousell" }, 
    { id: 318, name: "OneAset" }, { id: 315, name: "Justdating" }, { id: 314, name: "CommunityGaming" }, { id: 313, name: "Potato Chat" }, 
    { id: 312, name: "inDriver" }, { id: 311, name: "Kwai" }, { id: 338, name: "eWallet" }, { id: 346, name: "MPL" }, 
    { id: 345, name: "Flipkart" }, { id: 344, name: "RecargaPay" }, { id: 343, name: "Taki" }, { id: 342, name: "Depop" }, 
    { id: 341, name: "paycell" }, { id: 340, name: "Квартплата+" }, { id: 339, name: "米画师Mihuashi" }, { id: 206, name: "Mamba" }, 
    { id: 337, name: "Allegro" }, { id: 336, name: "Payzapp" }, { id: 335, name: "Фокстрот" }, { id: 334, name: "IPLwin" }, 
    { id: 333, name: "JTExpress" }, { id: 332, name: "Zilch" }, { id: 331, name: "OnTaxi" }, { id: 87, name: "Аптеки" }, 
    { id: 96, name: "BP - club" }, { id: 95, name: "Biglion" }, { id: 94, name: "Burger King" }, { id: 93, name: "Beget" }, 
    { id: 92, name: "Buff.163" }, { id: 90, name: "Blablacar" }, { id: 89, name: "Avito" }, { id: 88, name: "Ашан" }, 
    { id: 97, name: "Cita Previa" }, { id: 75, name: "MiChat" }, { id: 69, name: "WeChat" }, { id: 64, name: "DiDi taxi" }, 
    { id: 63, name: "Adidas" }, { id: 61, name: "Discord" }, { id: 59, name: "AliPay" }, { id: 58, name: "Papara" }, 
    { id: 57, name: "Careem" }, { id: 106, name: "Drom" }, { id: 114, name: "Battle" }, { id: 113, name: "Ftx" }, 
    { id: 112, name: "4FunLite" }, { id: 111, name: "TheFiniko" }, { id: 110, name: "FreedomFinance" }, { id: 109, name: "MobileV" }, 
    { id: 108, name: "Metro" }, { id: 107, name: "ДругВокруг" }, { id: 56, name: "Deliveroo" }, { id: 105, name: "DoDo pizza" }, 
    { id: 103, name: "Diffbot" }, { id: 102, name: "Cupis" }, { id: 100, name: "Coinut" }, { id: 99, name: "Кошелек" }, 
    { id: 98, name: "cg.163" }, { id: 10, name: "Google, Gmail, Youtube" }, { id: 22, name: "Foodpanda" }, { id: 20, name: "Twitter" }, 
    { id: 19, name: "Netflix" }, { id: 15, name: "Blizzard" }, { id: 13, name: "PayPal" }, { id: 12, name: "Steam" }, 
    { id: 11, name: "LINE" }, { id: 23, name: "ВК, Одноклассники, Юла (mail.ru group)" }, { id: 8, name: "Viber" }, 
    { id: 6, name: "Ebay" }, { id: 3, name: "Tinder" }, { id: 2, name: "Naver" }, { id: 33, name: "Nike" }, { id: 54, name: "AOL" }, 
    { id: 53, name: "Coinbase" }, { id: 49, name: "Yalla" }, { id: 48, name: "IMO messenger" }, { id: 41, name: "Tencent QQ" }, 
    { id: 38, name: "Jingdong" }, { id: 37, name: "Shopee" }, { id: 36, name: "Tiktok" }, { id: 115, name: "Getcontact" }, 
    { id: 32, name: "Craigslist" }, { id: 29, name: "Alibaba" }, { id: 28, name: "Amazon" }, { id: 27, name: "Yahoo" }, 
    { id: 26, name: "AirBnb" }, { id: 25, name: "Microsoft" }, { id: 24, name: "Uber" }, { id: 164, name: "Scruff" }, 
    { id: 173, name: "Tilda" }, { id: 172, name: "Twitch" }, { id: 170, name: "Stormgain" }, { id: 169, name: "Купер (СберМаркет)" }, 
    { id: 168, name: "Самокат" }, { id: 167, name: "Signal" }, { id: 166, name: "Spotify" }, { id: 165, name: "Switchere" }, 
    { id: 174, name: "Tokopedia" }, { id: 163, name: "ALLES Bonus" }, { id: 162, name: "Спортмастер" }, { id: 161, name: "Revolut" }, 
    { id: 160, name: "Regru" }, { id: 159, name: "Rostelecom" }, { id: 158, name: "Remit" }, { id: 157, name: "32Red" }, 
    { id: 183, name: "Weco" }, { id: 196, name: "Vinted" }, { id: 195, name: "Apple" }, { id: 190, name: "Weibo" }, 
    { id: 189, name: "Zhihu" }, { id: 188, name: "YoHo" }, { id: 186, name: "Yoshidrops" }, { id: 185, name: "Yandex" }, 
    { id: 184, name: "X5 Retail Group" }, { id: 155, name: "Payoneer" }, { id: 181, name: "Wildberries" }, { id: 180, name: "Вкусвилл" }, 
    { id: 179, name: "Vodorobot" }, { id: 178, name: "Верный" }, { id: 177, name: "Vivaldi" }, { id: 176, name: "TradingView" }, 
    { id: 175, name: "TalkU" }, { id: 123, name: "Humble bundle" }, { id: 131, name: "Kaggle" }, { id: 130, name: "KFC" }, 
    { id: 129, name: "KazanExpress" }, { id: 128, name: "JumpTaxi" }, { id: 127, name: "i.saku" }, { id: 126, name: "iHerb" }, 
    { id: 125, name: "LightChath" }, { id: 124, name: "hh.ru" }, { id: 132, name: "Киносервисы" }, { id: 122, name: "Ingalaxy" }, 
    { id: 121, name: "Gorillas" }, { id: 120, name: "MyGLO" }, { id: 119, name: "GroupMe" }, { id: 117, name: "GoGym" }, 
    { id: 116, name: "Grindr" }, { id: 145, name: "MVideo" }, { id: 154, name: "Protonmail" }, { id: 153, name: "Plenty of Fish" }, 
    { id: 152, name: "Paysafecard" }, { id: 151, name: "Pgbonus" }, { id: 150, name: "OLX" }, { id: 149, name: "Onrealt" }, 
    { id: 147, name: "Okcupid" }, { id: 146, name: "Mozen" }, { id: 382, name: "MyDailyCash" }, { id: 144, name: "Moteplassen" }, 
    { id: 142, name: "Магнолия" }, { id: 140, name: "MICO" }, { id: 139, name: "Магнит" }, { id: 137, name: "McDonalds" }, 
    { id: 135, name: "LOVE" }, { id: 134, name: "Лента" }, { id: 574, name: "Cathay" }, { id: 582, name: "MOMO" }, 
    { id: 581, name: "MarketPapa" }, { id: 580, name: "Mewt" }, { id: 579, name: "Cleartrip" }, { id: 578, name: "Uplay" }, 
    { id: 577, name: "JungleeRummy" }, { id: 576, name: "Band" }, { id: 575, name: "Globus" }, { id: 583, name: "MIYACHAT" }, 
    { id: 573, name: "Meesho" }, { id: 572, name: "Magicbricks" }, { id: 571, name: "JKF" }, { id: 570, name: "Asda" }, 
    { id: 569, name: "Bitso" }, { id: 568, name: "Ukrnet" }, { id: 567, name: "AliExpress" }, { id: 566, name: "Socios" }, 
    { id: 591, name: "Hotline" }, { id: 599, name: "Vidio" }, { id: 598, name: "99acres" }, { id: 597, name: "Mylove" }, 
    { id: 596, name: "Roposo" }, { id: 595, name: "Surveytime" }, { id: 594, name: "Paytm" }, { id: 593, name: "PagSmile" }, 
    { id: 592, name: "GyFTR" }, { id: 565, name: "JoGo" }, { id: 590, name: "AptekaRU" }, { id: 589, name: "GlobalTel" }, 
    { id: 588, name: "A9A" }, { id: 587, name: "Freelancer" }, { id: 586, name: "SamsungShop" }, { id: 585, name: "Fora" }, 
    { id: 584, name: "Humta" }, { id: 538, name: "RoyalWin" }, { id: 546, name: "FreeChargeApp" }, { id: 545, name: "Bukalapak" }, 
    { id: 544, name: "kolesa.kz" }, { id: 543, name: "Rozetka" }, { id: 542, name: "Verse" }, { id: 541, name: "AdaKami" }, 
    { id: 540, name: "Eyecon" }, { id: 539, name: "Hirect" }, { id: 547, name: "kufarby" }, { id: 537, name: "Rush" }, 
    { id: 536, name: "Foody" }, { id: 535, name: "Vivo" }, { id: 534, name: "SpatenOktoberfest" }, { id: 533, name: "ssoidnet" }, 
    { id: 531, name: "Cashmine" }, { id: 530, name: "E bike Gewinnspiel" }, { id: 555, name: "PingPong" }, { id: 564, name: "TeenPattiStarpro" }, 
    { id: 562, name: "Bykea" }, { id: 561, name: "FoodHub" }, { id: 560, name: "Global24" }, { id: 559, name: "Weverse" }, 
    { id: 558, name: "Wing Money" }, { id: 557, name: "IVI" }, { id: 556, name: "Nanovest" }, { id: 600, name: "Букмекерские" }, 
    { id: 554, name: "Monobank" }, { id: 553, name: "Aitu" }, { id: 552, name: "mzadqatar" }, { id: 551, name: "Голос" }, 
    { id: 550, name: "TurkiyePetrolleri" }, { id: 549, name: "Swiggy" }, { id: 548, name: "Kaya" }, { id: 644, name: "Icrypex" }, 
    { id: 652, name: "Rediffmail" }, { id: 651, name: "Uklon" }, { id: 650, name: "Mercado" }, { id: 649, name: "AgriDevelop" }, 
    { id: 648, name: "КухняНаРайоне" }, { id: 647, name: "炙热星河" }, { id: 646, name: "WashXpress" }, { id: 645, name: "PaddyPower" }, 
    { id: 653, name: "Prom" }, { id: 643, name: "РСА" }, { id: 642, name: "Getmega" }, { id: 641, name: "ezbuy" }, 
    { id: 640, name: "YikYak" }, { id: 639, name: "CloudChat" }, { id: 638, name: "Loanflix" }, { id: 637, name: "Pairs" }, 
    { id: 661, name: "SpotHit" }, { id: 669, name: "MarketGuru" }, { id: 668, name: "Adani" }, { id: 667, name: "TradeUP" }, 
    { id: 666, name: "Alfa" }, { id: 665, name: "MonobankIndia" }, { id: 664, name: "Dosi" }, { id: 663, name: "SuperS" }, 
    { id: 662, name: "Bazos" }, { id: 636, name: "Iwplay" }, { id: 660, name: "irancell" }, { id: 659, name: "Gemgala" }, 
    { id: 658, name: "Pocket52" }, { id: 657, name: "redBus" }, { id: 656, name: "Dotz" }, { id: 655, name: "BeReal" }, 
    { id: 654, name: "UWIN" }, { id: 608, name: "Lalamove" }, { id: 616, name: "LiveScore" }, { id: 615, name: "Picpay" }, 
    { id: 614, name: "miloan" }, { id: 613, name: "XadrezFeliz" }, { id: 612, name: "PharmEasy" }, { id: 611, name: "CliQQ" }, 
    { id: 610, name: "AVON" }, { id: 609, name: "IndianOil" }, { id: 617, name: "Kwork" }, { id: 607, name: "BLIBLI" }, 
    { id: 606, name: "RummyLoot" }, { id: 605, name: "Touchance" }, { id: 604, name: "MobiKwik" }, { id: 603, name: "Phound" }, 
    { id: 602, name: "Контур" }, { id: 601, name: "Şikayet var" }, { id: 626, name: "Nextdoor" }, { id: 634, name: "AUBANK" }, 
    { id: 633, name: "NoBroker" }, { id: 632, name: "Divar" }, { id: 631, name: "Powerkredite" }, { id: 630, name: "JamesDelivery" }, 
    { id: 629, name: "Voltz" }, { id: 628, name: "RummyCulture" }, { id: 627, name: "Gamer" }, { id: 529, name: "MediBuddy" }, 
    { id: 625, name: "ContactSys" }, { id: 623, name: "Taksheel" }, { id: 622, name: "MrQ" }, { id: 621, name: "Bisu" }, 
    { id: 620, name: "ZéDelivery" }, { id: 619, name: "Sizeer" }, { id: 618, name: "Temu" }, { id: 426, name: "BLS-SPAIN" }, 
    { id: 435, name: "Faberlic" }, { id: 434, name: "neftm" }, { id: 433, name: "PingCode" }, { id: 432, name: "hamrahaval" }, 
    { id: 431, name: "AptekiPlus" }, { id: 430, name: "Lotus" }, { id: 428, name: "HOP" }, { id: 427, name: "Kotak811" }, 
    { id: 436, name: "Fotka" }, { id: 425, name: "Sheerid" }, { id: 424, name: "AGIBANK" }, { id: 423, name: "Voggt" }, 
    { id: 422, name: "Feeld" }, { id: 421, name: "SneakersnStuff" }, { id: 420, name: "HandyPick" }, { id: 419, name: "Skroutz" }, 
    { id: 418, name: "СберАптека" }, { id: 445, name: "Agroinform" }, { id: 454, name: "Oriflame" }, { id: 452, name: "Bit" }, 
    { id: 451, name: "CMTcuzdan" }, { id: 450, name: "RosaKhutor" }, { id: 449, name: "Blued" }, { id: 448, name: "Максавит" }, 
    { id: 447, name: "МирЗнакомств" }, { id: 446, name: "MoneyСontrol" }, { id: 417, name: "YoWin" }, { id: 444, name: "Badoo" }, 
    { id: 443, name: "WorldRemit" }, { id: 442, name: "KeyPay" }, { id: 441, name: "Tick" }, { id: 440, name: "Akudo" }, 
    { id: 438, name: "Ace2Three" }, { id: 437, name: "BillMill" }, { id: 391, name: "Onet" }, { id: 399, name: "Swvl" }, 
    { id: 398, name: "Paysend" }, { id: 397, name: "Ziglu" }, { id: 396, name: "Lyft" }, { id: 395, name: "Flink" }, 
    { id: 394, name: "Окей" }, { id: 393, name: "Лейка" }, { id: 392, name: "Disney Hotstar" }, { id: 400, name: "IndiaGold" }, 
    { id: 390, name: "Eneba" }, { id: 389, name: "Fiqsy" }, { id: 387, name: "RuTube" }, { id: 386, name: "СhampionСasino" }, 
    { id: 385, name: "Belwest" }, { id: 384, name: "CafeBazaar" }, { id: 383, name: "TopDetal" }, { id: 408, name: "Rambler" }, 
    { id: 416, name: "RummyWealth" }, { id: 415, name: "HappyFresh" }, { id: 414, name: "Starbucks" }, { id: 413, name: "LOCO" }, 
    { id: 412, name: "Dostavista" }, { id: 411, name: "NCsoft" }, { id: 410, name: "Crowdtap" }, { id: 409, name: "Brahma" }, 
    { id: 455, name: "MoneyPay" }, { id: 407, name: "ChaingeFinance" }, { id: 406, name: "eFood" }, { id: 405, name: "Noon" }, 
    { id: 404, name: "WestStein" }, { id: 403, name: "cryptocom" }, { id: 402, name: "dbrUA" }, { id: 401, name: "Akulaku" }, 
    { id: 499, name: "AlloBank" }, { id: 508, name: "NovaPoshta" }, { id: 507, name: "MyMusicTaste" }, { id: 506, name: "Fruitz" }, 
    { id: 505, name: "Transfergo" }, { id: 504, name: "SoulApp" }, { id: 503, name: "Zolushka" }, { id: 501, name: "Coindcx" }, 
    { id: 500, name: "FunPay" }, { id: 509, name: "Fastmail" }, { id: 498, name: "FreshKarta" }, { id: 497, name: "Gittigidiyor" }, 
    { id: 496, name: "Myntra" }, { id: 495, name: "Thisshop" }, { id: 494, name: "Giftcloud" }, { id: 493, name: "Virgo" }, 
    { id: 492, name: "Siply" }, { id: 518, name: "MrGreen" }, { id: 527, name: "Santander" }, { id: 526, name: "PurePlatfrom" }, 
    { id: 524, name: "FarPost" }, { id: 523, name: "Grofers" }, { id: 522, name: "OPPO" }, { id: 521, name: "Algida" }, 
    { id: 520, name: "Okta" }, { id: 519, name: "Crickpe" }, { id: 491, name: "Oldubil" }, { id: 517, name: "Things" }, 
    { id: 516, name: "Weidian" }, { id: 514, name: "LongHu" }, { id: 513, name: "ApostaGanha" }, { id: 512, name: "RRSA" }, 
    { id: 511, name: "Winmasters" }, { id: 510, name: "GMNG" }, { id: 463, name: "Bitaqaty" }, { id: 471, name: "Casino, bet, gambling" }, 
    { id: 470, name: "NRJ Music Awards" }, { id: 469, name: "SnappFood" }, { id: 468, name: "Podeli" }, { id: 467, name: "Перекрес" }
]

const request = async (endpoint, params = {}) => {
    const config = {
        headers: {
            'x-apikey': global.rotp,
            'Accept': 'application/json'
        }
    }
    try {
        const url = `${baseUrl}${endpoint}`
        if (endpoint.includes('?')) {
            const { data } = await axios.get(url, config)
            return data
        }
        const { data } = await axios.get(url, { ...config, params })
        return data
    } catch (e) {
        return { success: false, error: e.message }
    }
}

const findService = async (query) => {
    const target = String(query).toLowerCase()
    const localResult = servicesList.find(s => 
        String(s.id) === target || 
        s.name.toLowerCase().includes(target)
    )
    if (localResult) return localResult

    const apiRes = await request('/v2/services')
    if (!apiRes.success || !apiRes.data) return null
    const apiResult = apiRes.data.find(s => 
        String(s.service_code) === target || 
        s.service_name.toLowerCase().includes(target)
    )
    if (apiResult) return { id: apiResult.service_code, name: apiResult.service_name }
    return null
}

const getDb = () => {
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '[]')
    return JSON.parse(fs.readFileSync(dbPath))
}

const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

const addSaldo = (userId, amount) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    if (user) {
        user.saldo += amount
        saveDb(db)
    } else {
        db.push({ id: userId, saldo: amount, orders: [] })
        saveDb(db)
    }
}

const minSaldo = (userId, amount) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    if (!user) return false
    if (user.saldo < amount) return false
    user.saldo -= amount
    saveDb(db)
    return true
}

const getSaldo = (userId) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    return user ? user.saldo : 0
}

const saveOrder = (userId, orderId, price) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    if (user) {
        user.orders.push({ id: orderId, price: price, status: 'pending' })
        saveDb(db)
    }
}

const getOrderPrice = (userId, orderId) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    if (!user) return 0
    const order = user.orders.find(o => o.id === orderId)
    return order ? order.price : 0
}

const removeOrder = (userId, orderId) => {
    const db = getDb()
    const user = db.find(u => u.id === userId)
    if (user) {
        user.orders = user.orders.filter(o => o.id !== orderId)
        saveDb(db)
    }
}

const getPendingDb = () => {
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, JSON.stringify({ deposits: [], orders: [] }))
    const data = JSON.parse(fs.readFileSync(pendingPath))
    if (!data.deposits) data.deposits = []
    if (!data.orders) data.orders = []
    return data
}

const savePendingDb = (data) => fs.writeFileSync(pendingPath, JSON.stringify(data, null, 2))

const getAllPending = () => getPendingDb().deposits

const saveDeposit = (id, userId, amount) => {
    const db = getPendingDb()
    db.deposits.push({ id, userId, amount, status: 'pending', date: new Date() })
    savePendingDb(db)
}

const getDeposit = (id) => {
    const db = getPendingDb()
    return db.deposits.find(d => d.id === id)
}

const removeDeposit = (id) => {
    const db = getPendingDb()
    db.deposits = db.deposits.filter(d => d.id !== id)
    savePendingDb(db)
}

const getAllPendingOrders = () => getPendingDb().orders

const savePendingOrder = (id, userId, price, phoneNumber) => {
    const db = getPendingDb()
    if (db.orders.find(o => o.id === id)) return 
    db.orders.push({ id, userId, price, phoneNumber, status: 'pending', date: new Date() })
    savePendingDb(db)
}

const removePendingOrder = (id) => {
    const db = getPendingDb()
    db.orders = db.orders.filter(o => o.id !== id)
    savePendingDb(db)
}

module.exports = {
    findService,
    balance: () => request('/v1/user/balance'),
    services: () => request('/v2/services'),
    countries: (service_id) => request(`/v2/countries?service_id=${service_id}`),
    operators: (country, provider_id) => request(`/v2/operators?country=${country}&provider_id=${provider_id}`),
    order: (number_id, provider_id, operator_id = 1) => request(`/v2/orders?number_id=${number_id}&provider_id=${provider_id}&operator_id=${operator_id}`),
    status: (order_id) => request(`/v1/orders/get_status?order_id=${order_id}`),
    setStatus: (order_id, status) => request(`/v1/orders/set_status?order_id=${order_id}&status=${status}`),
    depositCreate: (amount, payment_id = 'qris') => request(`/v2/deposit/create?amount=${amount}&payment_id=${payment_id}`),
    depositStatus: (deposit_id) => request(`/v2/deposit/get_status?deposit_id=${deposit_id}`),
    depositCancel: (deposit_id) => request(`/v1/deposit/cancel?deposit_id=${deposit_id}`),
    addSaldo,
    minSaldo,
    getSaldo,
    saveOrder,
    getOrderPrice,
    removeOrder,
    saveDeposit,
    getDeposit,
    removeDeposit,
    getAllPending,
    savePendingOrder,
    getAllPendingOrders,
    removePendingOrder
}