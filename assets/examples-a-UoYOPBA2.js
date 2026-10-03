const e={id:"grads",title:"GrADS — ızgarayı bir satırda görmek",intro:"GrADS bir programlama dili değil, bir ızgara-veri konsoludur. Veriyi bir tanım dosyası (.ctl) ile tanıtırsın, sonra pencereyi (lat/lon/lev/t) kurar ve `d <ifade>` dersin. Gücü şudur: ifadeyi yazdığın anda türev, döneli (curl), ıraksama ve zaman ortalaması hesaplanır — ara dosya üretmezsin. Bu bölümde sinoptik analiz haritalarının klasik altı tanesini kuruyoruz.",examples:[{id:"grads-500-shaded",title:"500 hPa jeopotansiyel yükseklik: gölgeli + izohat",lang:"grads",goal:"Sinoptik ölçekli akışın omurgasını görmek: sırt nerede, çukur (trough) nerede, akış hangi yönde kanalize oluyor.",data:"GFS 0.25° GRIB2; `g2ctl` + `gribmap` ile üretilmiş bir tanım dosyası (`gfs_20240115.ctl`). Değişken adı `hgtprs` (basınç seviyelerinde jeopotansiyel yükseklik, m).",code:`'reinit'
'open gfs_20240115.ctl'
'set lat 25 55'
'set lon 15 50'
'set lev 500'
'set t 1'
'set grads off'
'set mpdset hires'
'set gxout shaded'
'set clevs 5160 5220 5280 5340 5400 5460 5520 5580 5640 5700'
'set ccols 9 14 4 11 5 13 12 8 2 6 7'
'd hgtprs'
'run cbarn 0.9 0 5.5 0.4'
'set gxout contour'
'set cint 60'
'set ccolor 1'
'set cthick 6'
'set clab on'
'd hgtprs'
'draw title 500 hPa Jeopotansiyel Yukseklik (m) 15 Ocak 2024 00Z'
'printim z500.png x1100 y800 white'
'quit'`,lineNotes:[{line:1,text:"Önceki oturumdan kalan tüm ayarları ve açık dosyaları sıfırlar. Betiğin ilk satırı hep bu olmalı, yoksa bir önceki çizimin renk tablosu sana miras kalır."},{line:2,text:"Tanım dosyasını açar. GRIB2 için .ctl, `gribmap` ile indekslenmiş olmalıdır; yoksa GrADS veriyi bulur ama okuyamaz."},{line:3,text:"Enlem penceresi: 25N–55N. Bundan sonraki her `d` bu pencereyi kullanır."},{line:4,text:"Boylam penceresi: 15D–50D (Doğu Akdeniz + Anadolu + Kafkasya)."},{line:5,text:"Dikey pencereyi tek bir seviyeye kilitler: 500 hPa. Tek değer verildiği için sonuç 2 boyutlu bir haritadır."},{line:6,text:"Zaman indeksi 1 = dosyadaki ilk adım (analiz saati)."},{line:7,text:"GrADS’ın sol üstteki kendi damgasını kapatır — temiz bir sayfa için."},{line:8,text:"Yüksek çözünürlüklü kıyı/sınır veri kümesini seçer; varsayılan kaba harita 500 hPa haritasında çirkin durur."},{line:9,text:"Çizim kipini gölgeli (dolgulu) yapar."},{line:10,text:"İzohat sınırlarını elle verir: 60 m aralıklı klasik 500 hPa merdiveni. Elle vermek, farklı tarihlerdeki haritaların KARŞILAŞTIRILABİLİR olmasını sağlar."},{line:11,text:"Renk numaraları. Kural: renk sayısı = seviye sayısı + 1 (en alt ve en üst açık uçlar için)."},{line:12,text:"Gölgeli alanı çizer."},{line:13,text:"Renk skalasını (colorbar) yatay olarak alta koyar. `cbarn.gs` GrADS ile gelen standart yardımcı betiktir."},{line:14,text:"Kipi izohata çevirir — aynı alanı ikinci kez, bu kez çizgiyle basacağız."},{line:15,text:"İzohat aralığı 60 m. Gölge ile aynı merdiven olduğu için çizgiler renk sınırlarına oturur."},{line:16,text:"İzohat rengi 1 = siyah."},{line:17,text:"Çizgi kalınlığı; gölgenin üstünde okunur olması için 6."},{line:18,text:"İzohatların üstüne sayı etiketi bas."},{line:19,text:"Aynı alanı çizgi olarak üst üste bindirir."},{line:20,text:"Başlık. GrADS başlıkta `$` ve bazı noktalama işaretlerini yutar; sade metin yaz."},{line:21,text:"Ekrandaki sayfayı PNG olarak yazar; `white` arka planı beyaz yapar."},{line:22,text:'Toplu (batch) koşuda GrADS’tan çıkar: `grads -blc "run z500.gs"`.'}],explain:['500 hPa, atmosfer kütlesinin kabaca yarısının altında kaldığı seviyedir; bu yüzden "yönlendirici akış" (steering flow) haritası olarak okunur.',"Jeopotansiyel yükseklik, o basınç yüzeyinin deniz seviyesinden yüksekliğidir. Yüksek değer = sıcak/kabarık sütun (sırt), düşük değer = soğuk/çökmüş sütun (çukur).","İzohatların sıklaştığı yer, yükseklik gradyanının büyüdüğü yerdir; jeostrofik denge gereği rüzgâr orada hızlanır — jet ekseni izohat sıklığından okunur.","Aynı alanı iki kez çizmek (önce gölge, sonra çizgi) GrADS’ta standart tekniktir: göz rengi hızlı tarar, çizgi kesin değeri verir.","`set clevs` ile sabit merdiven kullanmak şarttır; otomatik seviyelerde her tarihin haritası başka bir ölçekle çizilir ve karşılaştırma anlamsızlaşır."],output:'Anadolu-merkezli bir harita. Renkler kuzeyde soğuk tonlarda (5200–5400 m), güneyde sıcak tonlarda (5600–5750 m). Üstüne 60 m aralıklı siyah izohatlar biner; Balkanlar ya da Karadeniz üzerinde güneye sarkan bir "U" görürsen bu bir çukurdur, doğusunda hava bozar. Altta yatay renk skalası, üstte tek satır başlık.',pitfalls:["`set lev 500` yerine `set lev 500 500` yazarsan GrADS dikeyi ARALIK sayar ve 3 boyutlu bir sonuç üretir; `d` o zaman harita yerine hata verir.","`set ccols` sayısı `set clevs` sayısından tam 1 fazla olmalı; bir eksik verirsen GrADS sessizce son rengi tekrar eder ve en yüksek sınıf kaybolur.",'`reinit` atlanırsa bir önceki `set clevs` yaşamaya devam eder — "haritam neden hep aynı renkte" hatasının bir numaralı kaynağı budur.',"`gribmap` çalıştırılmadan .ctl açılırsa dosya açılır ama `d` komutu sadece eksik-veri döner; önce `gribmap -i gfs_20240115.ctl` gerekir."],run:{script:`set lev 500
set gxout shaded+contour
set cmap viridis
set cint 60
set cbar on
set title 500 hPa jeopotansiyel yukseklik (m)
d gh`,level:"500",bridge:"Soldaki kod gerçek GrADS’tır ve GFS dosyası ister. Sağdaki çizim aynı alanın YolHava mini motorundaki karşılığıdır: veri canlı Open-Meteo basınç-seviyesi ızgarası, matematik aynı (gölge + 60 m izohat), yalnız çizici farklı. `hgtprs` yerine kısa ad `gh` kullanılır."},level:1,tags:["500 hPa","jeopotansiyel","gölgeli","izohat","sinoptik"]},{id:"grads-850-advection",title:"850 hPa sıcaklık taşınımı — `cdiff` ile gradyan",lang:"grads",goal:"Alçak seviyede sıcak mı soğuk mu hava geliyor sorusunu sayısal olarak yanıtlamak: taşınım pozitifse (sıcak advekasyon) yükselme ve bulut, negatifse çökme.",data:"GFS 0.25° basınç-seviyesi alanları: `tmpprs` (K), `ugrdprs`, `vgrdprs` (m/s), 850 hPa.",code:`'reinit'
'open gfs_20240115.ctl'
'set lat 30 50'
'set lon 18 48'
'set lev 850'
'set t 1'
'set grads off'
'define dx = cdiff(lon,x)*3.14159/180*6371000*cos(lat*3.14159/180)'
'define dy = cdiff(lat,y)*3.14159/180*6371000'
'define tc = tmpprs-273.16'
'define dtdx = cdiff(tc,x)/dx'
'define dtdy = cdiff(tc,y)/dy'
'define adv = -1*(ugrdprs*dtdx+vgrdprs*dtdy)*3600'
'set gxout shaded'
'set clevs -3 -2 -1 -0.5 0.5 1 2 3'
'set ccols 9 14 4 11 0 12 8 2 6'
'd smth9(adv)'
'run cbarn'
'set gxout contour'
'set cint 2'
'set ccolor 1'
'set cthick 5'
'd tc'
'draw title 850 hPa sicaklik tasinimi (K/saat, golge) ve T (C, izohat)'
'printim adv850.png x1100 y800 white'`,lineNotes:[{line:8,text:"Doğu-batı ızgara adımını METREYE çevirir: komşu boylamların farkı (derece) → radyan → yay uzunluğu, enlem kosinüsü ile daraltılır. `cdiff(lon,x)` merkezi farktır: (lon[i+1] − lon[i−1])."},{line:9,text:"Kuzey-güney adım. Enlemde kosinüs düzeltmesi yoktur, meridyen yayı her yerde aynıdır."},{line:10,text:"Sıcaklığı Kelvin’den Celsius’a çevirir. Taşınım hesabı için şart değil (fark aynı), ama izohat etiketleri okunur olsun diye."},{line:11,text:"∂T/∂x: merkezi fark bölü metre cinsinden adım. Birim: K/m."},{line:12,text:"∂T/∂y, aynı mantıkla."},{line:13,text:"Taşınım = −(u·∂T/∂x + v·∂T/∂y). Baştaki eksi işareti tanımın kendisidir: rüzgâr sıcaklığın AZALDIĞI yönden esiyorsa yerel sıcaklık artar. 3600 ile çarpım K/s → K/saat yapar."},{line:15,text:"Sıfır etrafında simetrik merdiven; ±0.5 K/saat altındaki gürültü için orta sınıf boş bırakılacak."},{line:16,text:"Orta renk 0 = şeffaf: zayıf taşınım boyanmaz, göz sadece anlamlı olanı görür."},{line:17,text:"`smth9` 9 noktalı ağırlıklı yumuşatma uygular. Türev alanları daima gürültülüdür; bu satır olmadan harita benek benek çıkar."},{line:19,text:"İkinci geçiş: sıcaklık alanının kendisini izohat olarak bindiriyoruz."},{line:23,text:"Sıcak/soğuk dil (cephe) burada görünür — taşınım gölgesi bu dillerin İLERLEME yönünü gösterir."}],explain:["Taşınım terimi −V·∇T, sıcaklık denkleminin en büyük ölçekli terimidir; sinoptik zaman ölçeğinde (12–36 saat) sıcaklık değişiminin çoğunu o açıklar.","GrADS’ta gradyan hazır gelmez: `cdiff` merkezi farkı verir, metreye çevirmek SENİN işindir. Bu bilinçli bir tasarım — ızgaranın gerçek adımını sen bilirsin.","Enlem kosinüsü unutulursa 40N’de doğu-batı adım %30 fazla hesaplanır ve zonal taşınım sistematik olarak küçük çıkar.","850 hPa seçilir çünkü sınır tabakası sürtünmesinin üstünde ama hâlâ alçak seviyededir: cephe yapıları burada en temiz görünür.","Pozitif gölge (sıcak advekasyon) genelde izentropik yükselme, bulut ve yağışla; negatif gölge (soğuk advekasyon) açılma ve kararsız kümülüslerle birlikte gider.","`define` sonucu BELLEĞE alır; aynı ifadeyi tekrar tekrar yazmak yerine bir kez tanımlamak hem hızlı hem okunur."],output:"Kırmızı-mavi ikili gölge haritası. Bir cephenin sıcak tarafında kırmızı (pozitif, +1…+3 K/saat), soğuk tarafında mavi bir bant görürsün; ikisi arasında ince şeffaf bir çizgi (sıfır hattı) cephenin izini verir. Üstünde 2 °C aralıklı siyah sıcaklık izohatları; izohatların rüzgâra dik olduğu yerlerde gölge en güçlüdür.",pitfalls:["`cdiff(lon,x)` ızgaranın kenarında tanımsızdır; haritanın dış bir sırası eksik-veri çıkar. Pencereyi ilgilendiğin alandan 1–2 derece geniş kur, sonra kırp.","`define` komutu o anki lat/lon/lev/t penceresini DONDURUR. Tanımladıktan sonra `set lev` değiştirirsen tanımlı alan eski seviyede kalır — sessiz ve tehlikeli bir hata.","Baştaki `-1` unutulursa haritanın işareti tersine döner ve soğuk advekasyonu sıcak diye okursun.","Yumuşatma yapmadan `set clevs` dar verirsen harita tuz-biber gürültüsüne döner; en az bir `smth9` geçişi neredeyse zorunludur."],run:{script:`set lev 850
set gxout shaded
set cmap rdbu
set clevs -3 -2 -1 -0.5 0.5 1 2 3
set cbar on
set title 850 hPa sicaklik tasinimi (K/saat)
d -3600*(u*ddx(t)+v*ddy(t))`,level:"850",bridge:"Mini motorda `ddx`/`ddy` zaten METRE başına türev döndürür; bu yüzden gerçek GrADS kodundaki dx/dy kurma satırları burada gerekmez. Matematik birebir aynıdır: −(u·∂T/∂x + v·∂T/∂y)·3600. Veri canlı Open-Meteo 850 hPa alanıdır."},level:2,tags:["taşınım","cdiff","gradyan","850 hPa","cephe"]},{id:"grads-wind-vector",title:"Rüzgâr vektörü + hız gölgesi (300 hPa jet)",lang:"grads",goal:"Jet akımının eksenini, çekirdeğini ve giriş/çıkış bölgelerini tek bakışta bulmak.",data:"GFS 0.25°, 300 hPa `ugrdprs` / `vgrdprs` (m/s).",code:`'reinit'
'open gfs_20240115.ctl'
'set lat 28 52'
'set lon 16 50'
'set lev 300'
'set t 1'
'set grads off'
'set mpdset hires'
'define spd = mag(ugrdprs,vgrdprs)'
'set gxout shaded'
'set clevs 30 40 50 60 70 80'
'set ccols 0 4 11 5 13 12 8'
'd spd'
'run cbarn'
'set gxout vector'
'set ccolor 1'
'set cthick 4'
'set arrscl 0.4 60'
'set arrlab off'
'd skip(ugrdprs,4,4);vgrdprs'
'draw title 300 hPa ruzgar hizi (m/s) ve vektorler'
'printim jet300.png x1100 y800 white'`,lineNotes:[{line:9,text:"`mag(u,v)` iki bileşenin karesel toplamının kökünü verir: rüzgâr hızı. GrADS’ın yerleşik fonksiyonudur."},{line:11,text:"30 m/s altını çizmiyoruz; jet tanımı zaten bu eşiğin üstüdür."},{line:12,text:"İlk renk 0 (şeffaf): 30 m/s altındaki alan boyanmaz, harita nefes alır."},{line:13,text:"Hız alanını gölgeli basar."},{line:15,text:"Çizim kipini vektöre alır. Bu kipte `d` iki ifade bekler, aralarında noktalı virgül."},{line:18,text:"`set arrscl <uzunluk> <değer>`: 60 m/s’lik bir okun sayfada 0.4 inç uzunluğunda olacağını söyler. Bu satır olmadan GrADS ölçeği kendi seçer ve iki harita karşılaştırılamaz."},{line:19,text:"Köşedeki referans ok etiketini kapatır (ölçeği zaten biz sabitledik)."},{line:20,text:"`skip(u,4,4)` her 4 ızgara noktasında bir ok çizer. Seyreltme olmadan 0.25° ızgarada harita ok çorbasına döner. Dikkat: `skip` yalnız İLK ifadeye uygulanır, ikincisi otomatik aynı seyreltmeyi alır."}],explain:["300 hPa üst troposferdir; orta enlemlerde jet akımı genelde 250–300 hPa arasında yerleşir.",'Gölge "ne kadar hızlı", ok "hangi yöne" sorusunu yanıtlar. İkisi üst üste basıldığında jet ekseni ve eğriliği aynı karede okunur.',"Jet çekirdeğinin (hız maksimumu) SOL-ÇIKIŞ ve SAĞ-GİRİŞ bölgeleri, üst seviyede ıraksamanın güçlü olduğu yerlerdir; alçak seviyede siklon gelişimi çoğu zaman bu iki bölgenin altında başlar.","Ok ölçeğini `arrscl` ile sabitlemek, zaman serisi çizerken zorunludur: aksi halde okların uzaması hız artışı sanılır ama aslında ölçek değişmiştir.","Seyreltme (`skip`) bir estetik tercih değil, okunabilirlik koşuludur; çözünürlük arttıkça atlama sayısı da artmalıdır."],output:"Anadolu ve kuzeyinde batıdan doğuya uzanan bir hız bandı: dıştan mavi-yeşil (30–45 m/s), merkeze doğru sarı-kırmızı (60–80 m/s). Üstünde seyreltilmiş siyah oklar bandı takip eder; bandın kıvrıldığı yerde oklar da kıvrılır. 30 m/s altındaki geniş alanlar beyaz kalır.",pitfalls:['`set gxout vector` kipinde tek ifade verirsen ("d ugrdprs") GrADS hata verir; vektör her zaman `u;v` ister.','`skip()` ikinci ifadeye ayrıca uygulanırsa ("skip(u,4,4);skip(v,4,4)") ızgaralar uyuşmaz ve oklar kaybolur.',"Gölgeyi vektörden SONRA çizersen renk okların üstünü kapatır; sıra her zaman önce gölge, sonra ok.","Bazı .ctl dosyalarında rüzgâr düğüm (knot) birimindedir; 30 m/s eşiği o zaman anlamsız olur. `set lev` sonrası bir `d ugrdprs` ile büyüklük mertebesini bir kez doğrula."],run:{script:`set lev 300
set gxout vector
set cmap thermal
set skip 3
set arrscl 0.4
set cbar on
set title 300 hPa ruzgar vektorleri (renk = hiz)
d u ; v`,level:"300",bridge:"Mini motorda vektör oklarının rengi doğrudan hızdan gelir, ayrı bir gölge geçişine gerek kalmaz; gerçek GrADS’ta bunu iki ayrı `d` ile yapmak gerekir. `set arrscl` burada tek sayı alır (ölçek çarpanı), GrADS’taki iki argümanlı biçimin sadeleştirilmişidir."},level:2,tags:["jet","vektör","300 hPa","rüzgâr","mag"]},{id:"grads-vorticity",title:"Bağıl ve mutlak vortisite — `hcurl`",lang:"grads",goal:"500 hPa akışındaki dönme merkezlerini bulmak; çukurların yaklaşan tarafını ve vortisite advekasyonunu görmek.",data:"GFS 0.25°, 500 hPa `ugrdprs`, `vgrdprs`, `hgtprs`.",code:`'reinit'
'open gfs_20240115.ctl'
'set lat 30 52'
'set lon 18 48'
'set lev 500'
'set t 1'
'set grads off'
'define vor = hcurl(ugrdprs,vgrdprs)*100000'
'define fcor = 2*7.292e-5*sin(lat*3.14159/180)*100000'
'define avor = vor+fcor'
'set gxout shaded'
'set clevs -8 -4 0 4 8 12 16 20 24'
'set ccols 9 4 5 0 12 8 2 6 7 3'
'd smth9(avor)'
'run cbarn'
'set gxout contour'
'set cint 60'
'set ccolor 1'
'set cthick 6'
'd hgtprs'
'draw title 500 hPa mutlak vortisite (1e-5 1/s) ve yukseklik (m)'
'printim vort500.png x1100 y800 white'`,lineNotes:[{line:8,text:"`hcurl(u,v)` yatay döneliyi (∂v/∂x − ∂u/∂y) doğrudan hesaplar; küresel geometri düzeltmesini GrADS kendi yapar. 1e5 ile çarpım, 1/s gibi çok küçük bir sayıyı okunur mertebeye taşır."},{line:9,text:"Coriolis parametresi f = 2Ω·sin(φ). Ω = 7.292e-5 rad/s. `lat` GrADS’ın yerleşik enlem alanıdır, ayrıca okumana gerek yoktur."},{line:10,text:"Mutlak vortisite = bağıl vortisite + planet vortisitesi. Korunum yasaları (potansiyel vortisite) bu toplam üzerinden yazılır."},{line:12,text:"Kuzey yarımkürede mutlak vortisite neredeyse hep pozitiftir; merdiven bu yüzden asimetriktir: negatif tarafta iki, pozitif tarafta yedi sınıf."},{line:14,text:"Yumuşatma. İkinci türev mertebesinde bir alan hesapladığımız için gürültü kaçınılmazdır."},{line:20,text:"Yükseklik izohatları bindirilir; vortisite maksimumunun izohatlara göre YERİ (çukurun batı mı doğu tarafı) yorumun anahtarıdır."}],explain:["Vortisite, akışkanın yerel dönme ölçüsüdür: bir çarkı akışa bıraksan ne kadar hızlı döneceğini söyler.","Kuzey yarımkürede saat yönünün tersi dönüş (siklonik) pozitiftir; 500 hPa çukurlarının tabanında pozitif vortisite maksimumu oturur.","Pozitif vortisite advekasyonu (PVA) — yani vortisite maksimumunun İLERİSİ — üst seviyede ıraksama ve yükselme üretir; yüzeydeki alçak basıncın derinleşmesi tipik olarak orada olur.","`hcurl` GrADS’ın küresel koordinatları bilen yerleşik fonksiyonudur; aynı işi `cdiff` ile elle kurmak mümkündür ama kosinüs düzeltmelerini unutma riski yüksektir.","f terimi enlemle değişir: 30N’de ~7.3e-5, 50N’de ~1.1e-4 1/s. Bu yüzden mutlak vortisite haritasında kuzeye doğru sistematik bir artış görürsün — bu sinyal değil, geometridir."],output:"Sarı-turuncu lekeler halinde pozitif vortisite merkezleri; çoğu 500 hPa izohatlarının güneye sarktığı U biçimli çukurların içinde oturur. Sırtlarda mavi/şeffaf düşük değerler. Üstte 60 m aralıklı siyah izohatlar. Bir lekenin doğu kenarı ile izohat sıklaşması çakışıyorsa orada aktif yükselme vardır.",pitfalls:["Ölçek çarpanını (1e5) renk merdiveninde unutursan tüm harita tek renk çıkar — değerler 1e-4 mertebesindedir, `set clevs 4 8 12` hiçbir noktayı yakalamaz.","`hcurl` kutba çok yakın enlemlerde kosinüs bölmesi yüzünden patlar; pencereyi 85° üzerine taşıma.","Bağıl vortisiteyi mutlak sanmak klasik hatadır: `vor` tek başına kuzeyde de güneyde de sıfır civarı salınır, korunum yorumları `avor` ile yapılır.","Yumuşatmayı abartma; üç-dört ardışık `smth9` gerçek maksimumu da siler ve çukuru olduğundan zayıf gösterir."],run:{script:`set lev 500
set gxout shaded
set cmap rdbu
set clevs -8 -4 0 4 8 12 16 20 24
set cbar on
set title 500 hPa mutlak vortisite (1e-5 1/s)
d 100000*(hcurl(u,v)+f)`,level:"500",bridge:"Mini motorda `f` doğrudan bir alan olarak vardır (Coriolis, 1/s), sinüs hesabını elle kurmana gerek yok; `hcurl` da aynı adla ve aynı anlamla çalışır. Gerçek GrADS’ta f’i `lat` üzerinden kendin tanımlarsın — tek fark budur."},level:3,tags:["vortisite","hcurl","Coriolis","PVA","500 hPa"]},{id:"grads-time-anomaly",title:"Zaman ortalaması ve anomali — `ave()`",lang:"grads",goal:'Bir günün durumunu "normal" ile kıyaslamak: bu hava dalgası gerçekten sıra dışı mı, yoksa mevsim normali mi?',data:"ERA5 850 hPa sıcaklık, 6 saatlik adımlarla bir aylık dosya (`era5_t850_jan.ctl`, 124 zaman adımı).",code:`'reinit'
'open era5_t850_jan.ctl'
'set lat 30 50'
'set lon 18 48'
'set lev 850'
'set t 1'
'define clim = ave(tmpprs,t=1,t=124)'
'set t 100'
'define anom = tmpprs-clim'
'set gxout shaded'
'set clevs -10 -6 -3 -1 1 3 6 10'
'set ccols 9 14 4 11 0 12 8 2 6'
'd anom'
'run cbarn'
'set gxout contour'
'set cint 2'
'set ccolor 1'
'set cthick 5'
'd clim-273.16'
'draw title 850 hPa sicaklik anomalisi (K) ay ortalamasina gore'
'printim anom850.png x1100 y800 white'`,lineNotes:[{line:7,text:'`ave(ifade, t=1, t=124)` zaman boyutunu ortalayarak yok eder. Sonuç 2 boyutlu bir "iklim" alanıdır. `define` onu belleğe alır; aksi halde her `d` için 124 adım yeniden okunurdu.'},{line:8,text:"Şimdi tek bir zaman adımına geçiyoruz (100. adım, ~25. günün 12Z’si)."},{line:9,text:"Anomali = o anın alanı − ortalama alan. `clim` zamansız olduğu için çıkarma sorunsuz yayılır."},{line:11,text:"Sıfır etrafında simetrik merdiven; ±1 K bandı boş bırakılır."},{line:12,text:"Ortadaki 0 = şeffaf renk: normale yakın alanlar boyanmaz."},{line:19,text:"Arka plana ortalamanın kendisini izohat olarak basıyoruz — anomali nereye oturuyor, onu görmek için."}],explain:["Ham alanlar mevsimsel sinyalle doludur; ocak ayında 850 hPa’da −5 °C okunması tek başına bir şey söylemez. Anlam, ortalamadan SAPMADADIR.",'GrADS’ta `ave` bir "boyut indirgeyicidir": belirttiğin boyut sonuçtan düşer. Aynı işlev `ave(x, lon=..., lat=...)` ile alan ortalamasına da uygulanır.','Burada referans olarak ayın kendi ortalaması alındı — buna "kendi içinde anomali" denir. Gerçek iklim anomalisi için 30 yıllık bir referans dosyası gerekir; yöntem değişmez, dosya değişir.',"Sıcaklık anomalisi haritası, bir sıcak/soğuk dalganın COĞRAFİ ŞEKLİNİ verir: dar bir dil mi, geniş bir kubbe mi? Bu şekil, olayın ömrü hakkında ipucudur.","`define` ile ara sonucu belleğe almak, uzun dosyalarda GrADS’ı onlarca kat hızlandırır; her `d` çağrısında diskin yeniden taranmasını engeller."],output:"Kırmızı ve mavi lekelerden oluşan bir sapma haritası. Normale yakın geniş alanlar beyaz. Bir soğuk dalga varsa Anadolu üzerinde −6…−10 K’lik koyu mavi bir kubbe, güneybatıda telafi eden ılık kırmızı bir alan görürsün. Üstünde 2 °C aralıklı, ay ortalamasının izohatları.",pitfalls:["`define clim = ave(...)` satırında pencere donar: ondan SONRA `set lat/lon` değiştirirsen `clim` eski pencerede kalır ve çıkarma işlemi ızgara uyuşmazlığı verir.","`t=124` dosyanın son adımından büyükse GrADS hata vermek yerine mevcut olana kadar ortalar; adım sayısını `q file` ile doğrula.","Eksik-veri (undef) içeren adımlar ortalamayı zehirler; ERA5 temizdir ama model çıktılarında `ave` öncesi `const(x,val,-u)` ile eksikleri ele almak gerekebilir.","Anomaliyi Celsius’a çevirmeye çalışma: iki alanın FARKI zaten K ile °C arasında aynıdır, 273.16 çıkarmak hatadır."],run:{script:`set lev 850
set t 0
set gxout shaded
set cmap rdbu
set cint 1
set cbar on
set title 850 hPa sicaklik alan-ortalamasindan sapma (K)
d t - mean(t)`,level:"850",bridge:'Mini motorun zaman ekseni tek adımlıdır: gerçek koddaki ZAMAN ortalaması yerine burada ALAN ortalaması (`mean`) referans alınır. Mantık aynıdır — "ortalamadan sapma" — ama referans zaman değil uzaydır. Bu farkı bilerek oku.'},level:2,tags:["anomali","ave","iklim","define","zaman ortalaması"]},{id:"grads-cross-section",title:"Dikey kesit — `set lat` tek, `set lev` aralık",lang:"grads",goal:"Bir enlem boyunca atmosferin dikey yapısını görmek: tropopoz nerede kırılıyor, jet çekirdeği hangi yükseklikte, cephe yüzeyi nasıl eğimli.",data:"GFS 0.25°, 1000–150 hPa arası tüm basınç seviyeleri: `tmpprs`, `ugrdprs`, `vgrdprs`.",code:`'reinit'
'open gfs_20240115.ctl'
'set lat 39.5'
'set lon 20 45'
'set lev 1000 150'
'set t 1'
'set grads off'
'set zlog on'
'set gxout shaded'
'set clevs -60 -50 -40 -30 -20 -10 0 10 20'
'set ccols 9 14 4 11 5 0 12 8 2 6'
'd tmpprs-273.16'
'run cbarn'
'set gxout contour'
'set cint 10'
'set ccolor 1'
'set cthick 5'
'd mag(ugrdprs,vgrdprs)'
'draw title 39.5N dikey kesit: T (C, golge) ve ruzgar hizi (m/s, izohat)'
'printim xsec395N.png x1100 y800 white'`,lineNotes:[{line:3,text:'Enlemi TEK değere sabitler. Bir boyutu tekleştirmek, GrADS’a "bu eksen artık yok" demektir.'},{line:4,text:"Boylam aralık kalır → yatay eksen olur."},{line:5,text:"Dikey ARALIK verilir → düşey eksen olur. Kural: `d` komutunun çizeceği şekil, aralık olarak açık kalan boyut sayısına göre belirlenir (1 → grafik, 2 → harita/kesit)."},{line:8,text:"Basınç eksenini logaritmik yapar. Atmosferde basınç yükseklikle üstel azaldığından, log eksen üst troposferi ezmeden gösterir; bu satır olmadan 300 hPa üstü sayfanın ince bir şeridine sıkışır."},{line:10,text:"Geniş bir sıcaklık merdiveni: yerde +20 °C, tropopozda −60 °C’ye kadar iner."},{line:12,text:"Sıcaklığı Celsius’a çevirip gölgeler."},{line:18,text:"Aynı kesit üzerine rüzgâr hızı izohatları; kapalı bir 50–70 m/s izohat halkası jet çekirdeğidir."}],explain:["Yatay harita atmosferin bir DİLİMİDİR; dikey kesit ise sütunun kendisini gösterir. Cephe, tropopoz ve jet gibi yapılar ancak dikeyde doğru anlaşılır.","GrADS’ta kesit almak için ayrı bir komut yoktur: hangi boyutu aralık bıraktığın çizimin türünü belirler. Bu, dilin en zarif tarafıdır.",'Sıcaklık izohatlarının sıklaştığı ve eğildiği bölge cephe bölgesidir (bir "cephe zonu"); eğim tipik olarak 1/100 ile 1/300 arasındadır, yani yatayda 300 km’de dikeyde 1–3 km.','Tropopoz, sıcaklık düşüşünün durduğu seviyedir; kesitte renk merdiveninin "ters dönmeye" başladığı yükseklik olarak görünür ve kutba doğru alçalır.',"Jet çekirdeği neredeyse her zaman tropopoz kırılmasının hemen altında, en güçlü yatay sıcaklık gradyanının üstünde oturur — kesit bu üç olguyu aynı karede yan yana koyar."],output:"Yatay ekseni boylam (20D–45D), düşey ekseni logaritmik basınç (altta 1000 hPa, üstte 150 hPa) olan bir dikdörtgen. Renkler alttan üste sıcaktan soğuğa geçer; 200–150 hPa civarında soğuk tavan. Üstünde 10 m/s aralıklı siyah izohatlar; 250–300 hPa seviyesinde kapalı bir halka jet çekirdeğini işaretler. Alt katmanlarda eğik sıkışan renk bantları cephe yüzeyidir.",pitfalls:["`set zlog on` unutulursa üst troposfer görsel olarak yok olur ve tropopoz analizini yapamazsın.","`set lat 39.5` ızgara noktasına denk gelmiyorsa GrADS en yakın noktayı değil, ara değer hesaplar — ince ölçekli yapıları yumuşatır. Tam ızgara enlemi seçmek daha temizdir.","Hem `set lat` hem `set lon` aralık bırakılırsa üç boyut açık kalır ve `d` hata verir; kesit için TAM BİR boyutu tekleştirmelisin.","Dikey eksende model seviyeleri (hybrid) varsa `set lev` basınç değil seviye indeksi bekler; `q ctlinfo` ile zdef satırını kontrol et."],run:{script:`set lev 250
set gxout shaded
set cmap thermal
set cint 3
set cbar on
set title 250 hPa sicaklik (C) seviyeyi degistirerek dikey yapiyi tara
d t`,level:"250",bridge:"DÜRÜST NOT: mini motor yalnız YATAY harita çizer, dikey kesit çizemez. Yapabileceğin şey, `set lev` satırını 925 → 850 → 700 → 500 → 300 → 250 diye değiştirip aynı alanın seviyeden seviyeye nasıl döndüğünü izlemektir; bu, kesitin kare kare hâlidir. Gerçek kesit için soldaki GrADS kodu gerekir."},level:3,tags:["dikey kesit","zlog","tropopoz","cephe","jet"]}]},a={id:"ncl",title:"NCL — yayın kalitesinde harita ve kesit",intro:'NCL (NCAR Command Language) NetCDF ile doğuştan uyumludur: değişkeni okuduğunda koordinatları, birimi ve uzun adı da gelir. Çizim işini `gsn_csm_*` ailesi yapar; her ayrıntı bir "kaynak" (resource) ile açılır. Öğrenme eğrisi kaynak adlarını tanımaktır: `cn` izohat, `mp` harita, `vc` vektör, `lb` renk skalası, `ti` başlık, `gsn` genel. Not: NCL 6.6.2 son sürümüdür ve bakımı durmuştur — ama mevcut milyonlarca satır betik hâlâ üretimde koşar, okumayı bilmek gerekir.',examples:[{id:"ncl-z500-map",title:"NetCDF aç, 500 hPa yükseklik haritası bas",lang:"ncl",goal:"Ham bir ERA5 dosyasından, koordinatlarıyla birlikte tek seviye çekip yayın kalitesinde bir harita üretmek.",data:"ERA5 basınç-seviyesi NetCDF (`era5_20240115.nc`); `z` değişkeni jeopotansiyeldir (m²/s²), yükseklik değildir.",code:`begin
  f = addfile("era5_20240115.nc", "r")
  z = f->z(0,{500},:,:)
  z = z / 9.80665
  z@units     = "m"
  z@long_name = "500 hPa geopotential height"

  wks = gsn_open_wks("png", "z500")
  res                      = True
  res@gsnMaximize          = True
  res@cnFillOn             = True
  res@cnLinesOn            = True
  res@cnLineLabelsOn       = True
  res@cnFillPalette        = "BlAqGrYeOrReVi200"
  res@cnLevelSelectionMode = "ManualLevels"
  res@cnMinLevelValF       = 5100.
  res@cnMaxLevelValF       = 5880.
  res@cnLevelSpacingF      = 60.
  res@mpMinLatF            = 25.
  res@mpMaxLatF            = 55.
  res@mpMinLonF            = 15.
  res@mpMaxLonF            = 50.
  res@mpDataBaseVersion    = "MediumRes"
  res@tiMainString         = "500 hPa Geopotential Height (m)"
  plot = gsn_csm_contour_map(wks, z, res)
end`,lineNotes:[{line:1,text:"`begin` ... `end` bloğu betiğin gövdesidir. NCL’de zorunlu değildir ama değişken kapsamını düzenler ve hata mesajlarını okunur kılar."},{line:2,text:"Dosyayı salt-okunur açar. `addfile` NetCDF, GRIB, HDF ve şapefile okuyabilir; uzantıya göre karar verir."},{line:3,text:"Dilimleme: zaman indeksi 0, KOORDİNAT değeri 500 (süslü parantez!), tüm enlem ve boylam. `{500}` yerine `500` yazsaydın 500. SEVİYE İNDEKSİNİ isterdin — NCL’in en ayırt edici sözdizimi budur."},{line:4,text:"Jeopotansiyeli yerçekimi ivmesine bölerek jeopotansiyel yüksekliğe çevirir. ERA5 `z` alanı m²/s² birimindedir; bu satır olmadan harita 50000 mertebesinde sayılar gösterir."},{line:5,text:"Birim özniteliğini elle düzeltiriz: NCL bölme işlemini yapar ama `units` özniteliğini güncellemez."},{line:6,text:"Uzun ad, grafiğin sol üst köşesinde otomatik yazılır."},{line:8,text:'Çıktı ortamı: "png", "pdf", "ps", "x11". Dosya adı uzantısız verilir.'},{line:9,text:"Kaynak nesnesi. NCL’de her çizim ayarı bu mantıksal değişkenin bir özniteliğidir."},{line:10,text:"Çizimi sayfaya sığdırıp büyütür; yayın için neredeyse her zaman açılır."},{line:11,text:"Dolgulu izohat (gölgeli alan) açılır."},{line:13,text:"Çizgi etiketleri (izohat üstündeki sayılar) açık."},{line:14,text:"Renk paleti adı. NCL ile gelen yüzlerce hazır tablodan biri; `cnFillPalette` 6.1 sonrası doğru yoldur."},{line:15,text:'"ManualLevels": alt sınır, üst sınır ve adımı SEN verirsin. Tarihler arası karşılaştırma için şarttır.'},{line:16,text:"Sayıların sonundaki nokta önemlidir: NCL’de `5100` tamsayı, `5100.` ondalıktır ve bu kaynaklar ondalık bekler."},{line:20,text:'Harita penceresi. `mpMinLatF` ve arkadaşları verildiğinde NCL otomatik olarak "LambertConformal" değil, varsayılan silindirik eşuzaklık izdüşümü kullanır.'},{line:24,text:'Kıyı çizgisi veri tabanı çözünürlüğü: "LowRes" (varsayılan), "MediumRes", "HighRes" (ayrı kurulum ister).'},{line:26,text:'`gsn_csm_contour_map`: veriyi koordinatlarına göre haritaya oturtur. "csm" = Climate System Model çizim arayüzü.'}],explain:["NCL’in temel vaadi şudur: değişkeni okuduğun anda koordinat eksenleri de gelir, bu yüzden çizici lat/lon’u ayrıca söylemene gerek kalmaz.","`{500}` ile `500` arasındaki fark bütün NCL öğreniminin kilit noktasıdır: süslü parantez KOORDİNAT DEĞERİ, düz sayı DİZİ İNDEKSİ demektir.","ERA5 `z` alanının jeopotansiyel olması sık düşülen bir tuzaktır; 9.80665’e bölmeden yapılan her yorum yanlıştır.","Kaynak (resource) mantığı bir kez oturunca NCL öğrenmek sözlük ezberine döner: ön ekten hangi ailenin ayarı olduğunu anlarsın.","Sabit seviye merdiveni (ManualLevels) bilimsel dürüstlüğün parçasıdır: otomatik ölçek, zayıf bir olayı görsel olarak şişirir."],output:'Doğu Akdeniz–Anadolu penceresinde, 60 m aralıklı dolgulu izohatlarla boyanmış bir 500 hPa haritası. Renkler kuzeyde mavi-yeşil, güneyde sarı-kırmızı. İzohat çizgileri ve üstlerinde sayı etiketleri görünür. Sağda ya da altta otomatik bir renk skalası, üstte başlık, sol üstte "500 hPa geopotential height", sağ üstte "m".',pitfalls:['`f->z(0,500,:,:)` yazarsan NCL 500. seviye indeksini arar ve dosyada 37 seviye varsa "subscript out of range" ile durur.','`z = z/9.80665` işleminden sonra `z@units` hâlâ "m**2 s**-2" kalır; düzeltmezsen grafiğin köşesinde yanlış birim yazar.',"ERA5 enlem ekseni AZALAN sırayla (90 → −90) gelir. `{25:55}` biçiminde dilimlersen NCL boş dizi döndürür; azalan eksende `{55:25}` yazmak gerekir.",'"HighRes" harita veri tabanı NCL ile birlikte kurulmaz; ayrıca indirilmemişse betik hata vermeden "MediumRes"e düşmez, doğrudan durur.'],run:{script:`set lev 500
set gxout shaded+contour
set cmap viridis
set cint 60
set cbar on
set title 500 hPa jeopotansiyel yukseklik (m)
d gh`,level:"500",bridge:"NCL’in kendisi tarayıcıda koşmaz. Sağdaki çizim aynı alanın YolHava mini motorundaki karşılığıdır: aynı büyüklük (jeopotansiyel yükseklik), aynı 60 m merdiven, aynı gölge+izohat kombinasyonu — farklı çizici. Mini motorda `gh` zaten metre cinsindendir, 9.80665 bölmesi gerekmez."},level:1,tags:["NetCDF","gsn_csm_contour_map","addfile","koordinat dilimleme"]},{id:"ncl-palette-levels",title:"Renk paleti ve `cnLevelSelectionMode`",lang:"ncl",goal:"Sıfır etrafında simetrik (ıraksayan) bir alanı doğru renklendirmek: sıcak/soğuk ayrımı gözle anında okunsun.",data:"Aynı ERA5 dosyası; `t` (K), 850 hPa.",code:`begin
  f = addfile("era5_20240115.nc", "r")
  t = f->t(0,{850},:,:)
  t = t - 273.15
  t@units     = "degC"
  t@long_name = "850 hPa temperature"

  wks = gsn_open_wks("png", "t850")
  res                        = True
  res@gsnMaximize            = True
  res@cnFillOn               = True
  res@cnLinesOn              = False
  res@cnFillPalette          = "BlueWhiteOrangeRed"
  res@cnLevelSelectionMode   = "ExplicitLevels"
  res@cnLevels               = (/-24,-18,-12,-8,-4,0,4,8,12,18,24/)
  res@lbOrientation          = "Vertical"
  res@lbBoxLinesOn           = False
  res@mpMinLatF              = 25.
  res@mpMaxLatF              = 55.
  res@mpMinLonF              = 15.
  res@mpMaxLonF              = 50.
  res@mpGeophysicalLineColor = "gray30"
  res@tiMainString           = "850 hPa Temperature (degC)"
  plot = gsn_csm_contour_map_ce(wks, t, res)
end`,lineNotes:[{line:3,text:"850 hPa sıcaklığını koordinat değeriyle çeker."},{line:4,text:"Kelvin → Celsius. Fark alındığı için ölçek değişmez, yalnız orijin kayar."},{line:11,text:"Dolgu açık."},{line:12,text:"Çizgi kapalı: renk yeterince bilgi taşıyorsa çizgi eklemek haritayı kirletir."},{line:13,text:"Iraksayan (diverging) palet: ortası beyaz, bir ucu mavi diğer ucu kırmızı. Sıfırın anlamlı olduğu her alan için doğru seçim budur."},{line:14,text:'"ExplicitLevels": adım sabit olmak zorunda değil, sınırları tek tek yazarsın.'},{line:15,text:"Eşit olmayan merdiven: uçlarda 6’şar derece, merkezde 4’er derece. Böylece hava durumunun yoğunlaştığı orta bandı daha ince ayırt edersin. `(/ ... /)` NCL’in dizi kurma sözdizimidir."},{line:16,text:"Renk skalasını dikey, sağ kenara alır."},{line:17,text:"Kutucuk kenarlıklarını kaldırır — sürekli bir renk şeridi görünümü verir."},{line:22,text:"Kıyı çizgisini gri yapar; siyah çizgi soğuk renklerin üstünde ağır durur."},{line:24,text:'`_ce` soneki "cylindrical equidistant" izdüşümünü açıkça seçer; `gsn_csm_contour_map` ile aynı sonucu verir ama niyeti belgeler.'}],explain:["Renk seçimi süsleme değil, veri kodlamasıdır. Sıfırın fiziksel anlamı varsa (donma noktası, anomali sıfırı) palet MUTLAKA ıraksayan ve merkezi beyaz olmalıdır.",'"ManualLevels" eşit adım verir; "ExplicitLevels" adımı serbest bırakır; "AutomaticLevels" (varsayılan) veriye bakıp kendi karar verir ve karşılaştırmayı bozar.',"Merdiveni ortada sıklaştırmak bilinçli bir analitik tercihtir: 850 hPa sıcaklığının sinoptik değişkenliği çoğunlukla −10…+10 °C bandındadır.","Sıcaklık izohatını kapatıp yalnız renk bırakmak, üstüne başka bir alan (basınç, rüzgâr) bindirmeyi planladığında doğru olandır.",'850 hPa sıcaklığı yüzey sıcaklığının "sınır tabakasından arınmış" hâlidir; hava kütlesi sınıflandırması bu seviyeden yapılır.'],output:"Kenarlıksız, dikey renk skalalı bir 850 hPa sıcaklık haritası. Kuzeyde koyu mavi (−18…−24 °C), Ege ve Akdeniz üzerinde beyazdan turuncuya geçiş, güneyde kırmızı. Beyaz bandın geçtiği yer kabaca 0 °C izotermidir — kar/yağmur ayrımının klasik göstergesi. Gri kıyı çizgileri, üstte başlık.",pitfalls:['`cnLevels` verip `cnLevelSelectionMode` ayarını "ExplicitLevels" yapmayı unutmak: NCL diziyi sessizce yok sayar ve otomatik seviyeler çizer.',"`gsnSpreadColors` kaynağı NCL 6.1’den beri gereksizdir (varsayılan zaten True); eski betiklerde görürsen silebilirsin ama `gsn_define_colormap` ile karıştırılırsa renkler kayar.","Iraksayan paleti sıfırı anlamsız bir alanda (örneğin rüzgâr hızı) kullanmak okuyucuyu yanıltır: orada sıralı (sequential) palet gerekir.",'`t = t - 273.15` işleminden sonra `t@units` güncellenmezse renk skalası başlığında "K" yazar ve harita kendi kendisiyle çelişir.'],run:{script:`set lev 850
set gxout shaded
set cmap rdbu
set clevs -24 -18 -12 -8 -4 0 4 8 12 18 24
set cbar on
set title 850 hPa sicaklik (C)
d t`,level:"850",bridge:'Mini motorun `rdbu` renk haritası NCL’in "BlueWhiteOrangeRed" paletinin karşılığıdır (ortası açık, uçları mavi/kırmızı) ve `set clevs` tam olarak `cnLevels` gibi çalışır: eşit olmayan merdiven kabul eder. Veri canlı Open-Meteo 850 hPa sıcaklığıdır ve zaten °C birimindedir.'},level:1,tags:["renk paleti","cnLevels","ıraksayan palet","850 hPa"]},{id:"ncl-contour-wind",title:"Rüzgâr vektörü + hız gölgesi (`overlay`)",lang:"ncl",goal:"Jet akımını hem şiddet hem yön olarak tek karede göstermek; iki ayrı çizimi NCL’in `overlay` mekanizmasıyla birleştirmek.",data:"ERA5 300 hPa `u` ve `v` (m/s).",code:`begin
  f   = addfile("era5_20240115.nc", "r")
  u   = f->u(0,{300},:,:)
  v   = f->v(0,{300},:,:)
  spd = sqrt(u^2 + v^2)
  copy_VarCoords(u, spd)
  spd@units     = "m/s"
  spd@long_name = "300 hPa wind speed"

  wks  = gsn_open_wks("png", "jet300")
  cres                      = True
  cres@gsnDraw              = False
  cres@gsnFrame             = False
  cres@cnFillOn             = True
  cres@cnLinesOn            = False
  cres@cnFillPalette        = "WhiteBlueGreenYellowRed"
  cres@cnLevelSelectionMode = "ManualLevels"
  cres@cnMinLevelValF       = 20.
  cres@cnMaxLevelValF       = 80.
  cres@cnLevelSpacingF      = 5.
  cres@mpMinLatF            = 25.
  cres@mpMaxLatF            = 55.
  cres@mpMinLonF            = 15.
  cres@mpMaxLonF            = 50.
  cres@tiMainString         = "300 hPa wind speed and vectors"
  map = gsn_csm_contour_map(wks, spd, cres)

  vres                         = True
  vres@gsnDraw                 = False
  vres@gsnFrame                = False
  vres@vcGlyphStyle            = "CurlyVector"
  vres@vcRefMagnitudeF         = 40.
  vres@vcRefLengthF            = 0.045
  vres@vcMinDistanceF          = 0.017
  vres@vcLineArrowColor        = "black"
  vres@vcRefAnnoOrthogonalPosF = -0.16
  vec = gsn_csm_vector(wks, u, v, vres)

  overlay(map, vec)
  draw(map)
  frame(wks)
end`,lineNotes:[{line:5,text:"Hız büyüklüğü. NCL’de `^` üs operatörüdür."},{line:6,text:"KRİTİK: aritmetik ifadeler NCL’de koordinatları ve öznitelikleri DÜŞÜRÜR. `copy_VarCoords` lat/lon eksenlerini geri takar; bu satır olmadan `gsn_csm_contour_map` haritaya oturtamaz."},{line:12,text:"`gsnDraw=False`: çizimi hazırla ama kâğıda basma. Bindirme yapacağımız için zorunludur."},{line:13,text:'`gsnFrame=False`: sayfayı çevirme. İkisi birlikte "nesneyi oluştur, sakla" anlamına gelir.'},{line:16,text:"Sıralı (sequential) palet: hız sıfırdan yukarı tek yönlü bir büyüklüktür, ıraksayan palet burada yanlış olurdu."},{line:18,text:"20 m/s altı da boyanır ama açık tonlarda kalır; jet çekirdeği kırmızıya oturur."},{line:26,text:"Arka plan çizimi: harita + gölgeli hız. Henüz kâğıtta değil, bellekte."},{line:31,text:'"CurlyVector": ok yerine akım çizgisi görünümlü kıvrık oklar. Akışın eğriliğini düz oklardan çok daha iyi gösterir.'},{line:32,text:"Referans büyüklük: 40 m/s."},{line:33,text:"Referans uzunluk, NDC biriminde (sayfanın kesri). Bu iki satır birlikte ok ölçeğini SABİTLER; farklı tarihler karşılaştırılabilir olur."},{line:34,text:"İki ok arası en küçük mesafe. Seyreltmeyi ızgaraya göre değil SAYFAYA göre yapar — çözünürlük değişse bile harita aynı sıklıkta kalır. Bu, GrADS’ın `skip()` yaklaşımından daha sağlamdır."},{line:36,text:"Referans ok etiketini çizimin içine çeker (negatif değer yukarı taşır)."},{line:37,text:"Haritasız vektör çizimi: `gsn_csm_vector` (map’siz), bindirilmek üzere."},{line:39,text:"Bindirme: vektör çizimi harita çiziminin koordinat sistemine oturtulur."},{line:40,text:"Şimdi kâğıda bas."},{line:41,text:"Sayfayı çevir — dosya ancak bu satırdan sonra diske yazılır."}],explain:["NCL’de bindirme (overlay) mimarisi şudur: her çizim bir nesnedir, `gsnDraw/gsnFrame` kapalıyken nesne oluşur, `overlay` onları aynı eksene bağlar, `draw`+`frame` çıktı üretir.","Bindirmede TABAN çizim haritalı olan olmalıdır; üste binen `gsn_csm_vector` (veya `gsn_csm_contour`) haritasız sürüm olmalıdır. Ters yaparsan iki ayrı harita üst üste basılır.","Hız için sıralı, sıcaklık anomalisi için ıraksayan palet — renk seçimi büyüklüğün fiziksel doğasından çıkar.","`vcMinDistanceF` ile seyreltme, çözünürlükten bağımsız bir okunabilirlik garantisi verir: 0.25° de olsa 0.1° de olsa sayfada aynı sıklıkta ok görürsün.","CurlyVector, jet akımının eğriliğini (kıvrım vortisitesinin işaretini) gözle okumayı kolaylaştırır; düz oklar bu bilgiyi gizler.","Jetin sol-çıkış bölgesi üst seviyede ıraksama demektir; gölgedeki kırmızı çekirdeğin bittiği yerin kuzeyine bak, yüzeydeki alçak orada derinleşir."],output:'Beyazdan kırmızıya giden bir hız alanı: batıdan doğuya uzanan bir bant, çekirdeğinde 70–80 m/s. Üstünde siyah kıvrık oklar akışı takip eder, çukurda güneye kıvrılıp sırtta kuzeye döner. Sağ üstte "40 m/s" yazan bir referans ok. Altta/sağda renk skalası, üstte tek satır başlık.',pitfalls:['`copy_VarCoords` unutulursa NCL "coordinate variable not found" demez; haritayı çizer ama veriyi 0–360 indeks ekseninde konumlandırır ve sonuç kıyılarla hiç uyuşmaz.',"`gsnDraw`/`gsnFrame` kapatılmazsa `overlay` çağrısından önce iki ayrı sayfa basılır ve bindirme etkisiz kalır.","`vcRefMagnitudeF` verilip `vcRefLengthF` verilmezse ölçek yine otomatik seçilir; ikisi birlikte olmalıdır.","`vcMinDistanceF` çok küçük bırakılırsa (örn. 0.005) yüksek çözünürlüklü veride on binlerce ok çizilir, PNG üretimi dakikalarca sürer."],run:{script:`set lev 300
set gxout vector
set cmap thermal
set skip 3
set arrscl 0.5
set cbar on
set title 300 hPa ruzgar vektorleri (renk = hiz)
d u ; v`,level:"300",bridge:"NCL tarayıcıda koşmaz; buradaki çizim aynı alanın YolHava mini motorundaki karşılığıdır — aynı veri (300 hPa u, v), aynı matematik, farklı çizici. Mini motor bindirme (overlay) kurmaz: okları doğrudan hıza göre renklendirir, yani NCL’deki iki geçişlik işi tek geçişte yapar."},level:2,tags:["overlay","vektör","jet","copy_VarCoords","300 hPa"]},{id:"ncl-pres-hgt",title:"Dikey kesit — `gsn_csm_pres_hgt`",lang:"ncl",goal:"Bir enlem boyunca sıcaklığın dikey yapısını, basınç ekseni doğru ölçeklenmiş hâlde çizmek.",data:"ERA5 basınç seviyeleri (1000–100 hPa), `t` (K), 39.5N kesiti.",code:`begin
  f = addfile("era5_20240115.nc", "r")
  t = f->t(0,:,{39.5},{15:50})
  t = t - 273.15
  t@units     = "degC"
  t@long_name = "Temperature"

  wks = gsn_open_wks("png", "xsec395N")
  res                      = True
  res@gsnMaximize          = True
  res@cnFillOn             = True
  res@cnLinesOn            = True
  res@cnLineLabelsOn       = False
  res@cnLineColor          = "gray40"
  res@cnFillPalette        = "BlueWhiteOrangeRed"
  res@cnLevelSelectionMode = "ManualLevels"
  res@cnMinLevelValF       = -65.
  res@cnMaxLevelValF       =  25.
  res@cnLevelSpacingF      = 5.
  res@tmYRMode             = "Automatic"
  res@tiMainString         = "39.5N vertical cross section"
  res@tiXAxisString        = "Longitude"
  plot = gsn_csm_pres_hgt(wks, t, res)
end`,lineNotes:[{line:3,text:"Dilimleme sırası dosyadaki boyut sırasıdır: (time, level, lat, lon). Zamanı tekleştirdik, seviyeyi tam bıraktık, enlemi tek koordinata sabitledik, boylamı aralık verdik. Sonuç (lev, lon) boyutlu 2B dizi."},{line:4,text:"Celsius’a çevirme."},{line:12,text:"Hem dolgu hem çizgi: kesitte izotermlerin eğimi cephe analizinin kendisidir, çizgiyi kapatmak bilgi kaybıdır."},{line:14,text:"Çizgiyi gri yaparak dolgunun önüne geçmesini engelleriz."},{line:20,text:'`tmYRMode = "Automatic"` sağ eksende basınca karşılık gelen yaklaşık YÜKSEKLİK ölçeğini basar. `gsn_csm_pres_hgt`’in en kullanışlı özelliğidir: okuyucu hem hPa hem km okur.'},{line:23,text:"`gsn_csm_pres_hgt` düşey ekseni otomatik olarak basınca göre (logaritmik benzeri, ters yönlü) kurar; `gsn_csm_contour` kullansaydın 1000 hPa üstte, 100 hPa altta çıkardı."}],explain:['NCL kesit çizerken dizinin KOORDİNAT ADINA bakar: düşey eksende "lev"/"level"/"plev" tanırsa basınç mantığını uygular.',"Basınç ekseni ters çevrilmelidir (aşağı doğru artan) ve logaritmik ölçeklenmelidir; `gsn_csm_pres_hgt` ikisini de kendisi yapar, bu yüzden kesitler için doğru fonksiyon budur.","Sağdaki yaklaşık yükseklik ekseni standart atmosfer dönüşümüyle üretilir; gerçek jeopotansiyel yükseklik değildir, kabaca konumlandırma içindir.","İzotermlerin yatayla yaptığı açı, cephe bölgesinin eğimini verir; dik izotermler güçlü baroklinlik, yatay izotermler barotropik (eşdeğer) bir yapı demektir.","Rüzgârı da eklemek istersen `gsn_csm_pres_hgt_vector(wks, t, u, w, res)` aynı eksen üzerine vektör basar — kesit için ayrı bir fonksiyon ailesi vardır."],output:"Yatay ekseni boylam (15D–50D), düşey ekseni basınç (altta 1000 hPa, üstte 100 hPa, sağda yaklaşık km) olan bir dikdörtgen. Altta kırmızı/turuncu (sıcak), yukarı çıkıldıkça beyaz sonra koyu mavi. 200–150 hPa dolayında rengin durağanlaştığı şerit tropopozdur. Gri izoterm çizgileri, alt-orta troposferde eğik bir demet oluşturuyorsa orası cephe bölgesidir.",pitfalls:["`{39.5}` dosyadaki enlem ızgarasında yoksa NCL en yakın noktayı seçmez; hata verir. ERA5 0.25° ızgarada 39.5 vardır, 39.6 yoktur.",'Düşey koordinatın adı standart değilse (`isobaricInhPa` gibi) NCL basınç eksenini tanımayabilir; `t!0 = "lev"` ile adı elle düzeltmek gerekir.',"Seviye birimi Pa ise (bazı CF dosyalarında böyledir) eksen 100000’den 10000’e gider ve etiketler okunmaz olur; `t&lev = t&lev/100` ile hPa’ya çevir.","Sadece 4–5 seviyesi olan bir dosyada kesit çizmek yanıltıcıdır: NCL seviyeler arasını doğrusal doldurur ve olmayan yapılar uydurur gibi görünür."],run:{script:`set lev 250
set gxout shaded
set cmap thermal
set cint 3
set cbar on
set title 250 hPa sicaklik (C)
d t`,level:"250",bridge:"DÜRÜST NOT: mini motor dikey kesit çizemez, yalnız yatay harita basar. Buradaki çizim kesitin TEK BİR SATIRIDIR (250 hPa). `set lev` satırını 925/850/700/500/300/250 diye değiştirerek kesiti kare kare tarayabilirsin; gerçek kesit için soldaki NCL kodu gerekir."},level:2,tags:["dikey kesit","pres_hgt","tropopoz","basınç ekseni"]},{id:"ncl-panel-levels",title:"Panel: dört seviye yan yana + zaman ortalaması",lang:"ncl",goal:'Rüzgâr hızının seviyeden seviyeye nasıl değiştiğini tek sayfada göstermek — dikey kesitin "kare kare" alternatifi.',data:"ERA5 `u`, `v`; 850/700/500/300 hPa; dosyadaki tüm zaman adımlarının ortalaması.",code:`begin
  f     = addfile("era5_20240115.nc", "r")
  levs  = (/850, 700, 500, 300/)
  wks   = gsn_open_wks("png", "panel_levels")
  plots = new(dimsizes(levs), graphic)

  res                      = True
  res@gsnDraw              = False
  res@gsnFrame             = False
  res@cnFillOn             = True
  res@cnLinesOn            = False
  res@cnFillPalette        = "WhiteBlueGreenYellowRed"
  res@cnLevelSelectionMode = "ManualLevels"
  res@cnMinLevelValF       = 0.
  res@cnMaxLevelValF       = 70.
  res@cnLevelSpacingF      = 5.
  res@lbLabelBarOn         = False
  res@mpMinLatF            = 25.
  res@mpMaxLatF            = 55.
  res@mpMinLonF            = 15.
  res@mpMaxLonF            = 50.

  do i = 0, dimsizes(levs)-1
    u     = f->u(:,{levs(i)},:,:)
    v     = f->v(:,{levs(i)},:,:)
    spd   = sqrt(u^2 + v^2)
    copy_VarCoords(u, spd)
    smean = dim_avg_n_Wrap(spd, 0)
    res@gsnLeftString = levs(i) + " hPa"
    plots(i) = gsn_csm_contour_map(wks, smean, res)
    delete([/u, v, spd, smean/])
  end do

  pres                    = True
  pres@gsnPanelLabelBar   = True
  pres@gsnPanelMainString = "Gun ortalamasi ruzgar hizi (m/s)"
  gsn_panel(wks, plots, (/2,2/), pres)
end`,lineNotes:[{line:3,text:"Seviyeleri bir dizi olarak tanımlarız; döngü bunun üzerinden gider."},{line:5,text:"`new(n, graphic)` çizim nesnelerini tutacak bir dizi ayırır. NCL’de `graphic` bir veri tipidir."},{line:8,text:"Panelde her alt çizim önce bellekte oluşturulur; bu yüzden draw/frame kapalı."},{line:17,text:"Her alt çizimin kendi renk skalası kapatılır — panelin ortak skalası kullanılacak."},{line:23,text:"Döngü. NCL’de `do i = 0, n-1` biçimi; `end do` ile kapanır."},{line:24,text:"Bu kez zamanı TAM bırakıyoruz (`:`), çünkü ortalamasını alacağız. Sonuç (time, lat, lon)."},{line:26,text:"Hız büyüklüğü — metadata düşer."},{line:27,text:"Koordinatları geri takar. Bir sonraki satırdaki `_Wrap` ancak bundan sonra anlamlıdır."},{line:28,text:'`dim_avg_n_Wrap(x, 0)` sıfırıncı boyut (zaman) üzerinden ortalar ve koordinatları KORUR. `_Wrap` soneki NCL’de "metadata’yı taşı" demektir; sonekisiz sürüm çıplak dizi döndürür.'},{line:29,text:"Sol üst köşe yazısı. NCL’de tamsayı + string birleştirmesi `+` ile doğrudan yapılır."},{line:31,text:'`delete([/ ... /])` liste sözdizimiyle birden çok değişkeni birden siler. Döngüde ŞARTTIR: bir sonraki seviyede dizi boyutu değişirse NCL "dimension mismatch" verir.'},{line:34,text:"Panel için ayrı bir kaynak nesnesi."},{line:35,text:"Tüm alt çizimler için tek ortak renk skalası basar — ancak alt çizimlerin seviyeleri AYNI ise anlamlıdır."},{line:37,text:"`(/2,2/)` yerleşim: 2 satır, 2 sütun. Toplam alt çizim sayısıyla uyuşmalıdır."}],explain:["Panel, karşılaştırmanın en dürüst biçimidir: aynı renk merdiveni, aynı harita penceresi, yan yana dört kare.","`_Wrap` sonekli fonksiyonlar NCL’in metadata felsefesidir: hesap yaparken koordinatları kaybetmemek için ayrı bir fonksiyon ailesi vardır.","Döngüde `delete` alışkanlığı NCL’e özgü bir disiplindir; dil, yeniden atamada boyut değişimine izin vermez.","Fizik olarak: rüzgâr hızı 850’den 300’e doğru sistematik artar (termal rüzgâr). Panelde bu artışı tek bakışta görürsün — dikey kesit yapmadan dikey yapıyı okumuş olursun.","Ortak renk skalası (gsnPanelLabelBar) yalnızca tüm alt çizimlerde `cnLevels` aynıysa kullanılmalıdır; farklıysa NCL yine tek skala basar ve sessizce yanlış bir grafik üretirsin."],output:"2×2 yerleşimli dört küçük harita. Sol üst 850 hPa: çoğunlukla açık mavi, 10–20 m/s. Sağ üst 700 hPa biraz daha hızlı. Sol alt 500 hPa: belirgin bir bant. Sağ alt 300 hPa: kırmızıya varan 60–70 m/s’lik jet. Altta tek ortak renk skalası, en üstte tek ana başlık, her karenin sol üstünde seviye etiketi.",pitfalls:['`delete` unutulursa ikinci seviyede "Dimension size mismatch" hatası alırsın; NCL’de bir değişkene farklı boyutta yeniden atama yapılamaz.',"`dim_avg_n_Wrap` yerine `dim_avg_Wrap` kullanmak son boyutu ortalar — zaman ilk boyutta olduğu için yanlış eksende ortalama alırsın ve hata mesajı çıkmaz.","`(/2,2/)` yerine `(/1,4/)` verirsen dört harita tek satıra sıkışır ve okunmaz hâle gelir; panel boyutu çizim sayısıyla ve sayfa oranıyla birlikte seçilmelidir.","`gsnPanelMainString` NCL 6.4 öncesinde yoktur; eski sürümlerde `txString` kullanılır. Betiği paylaşacaksan sürümü not et."],run:{script:`set lev 700
set gxout shaded
set cmap blues
set cint 5
set cbar on
set title 700 hPa ruzgar hizi (m/s)
d ws`,level:"700",bridge:"Mini motor tek panel çizer; NCL’in 2×2 yerleşimini kuramaz. Buradaki çizim panelin bir karesidir. `set lev` satırını 850/700/500/300 arasında değiştirip aynı renk merdiveniyle karşılaştırırsan panelin sağladığı bilgiyi elde edersin. `ws` alanı mini motorda hazır gelir — `sqrt(u^2+v^2)` yazmana gerek yok."},level:3,tags:["panel","gsn_panel","dim_avg_n_Wrap","termal rüzgâr"]},{id:"ncl-area-average",title:"Alan ortalaması — `wgt_areaave` (cos-lat ağırlığı)",lang:"ncl",goal:"Bir bölgenin ortalama sıcaklığını DOĞRU hesaplamak: küre üzerinde ızgara kutuları eşit alanlı değildir, ortalama ağırlıklı olmalıdır.",data:"ERA5 2 m sıcaklık (`t2m`), bir yıllık günlük dosya; Türkiye kutusu 34–43N, 25–45D.",code:`begin
  f   = addfile("era5_t2m_2024.nc", "r")
  t2m = f->t2m(:,{43:34},{25:45})
  t2m = t2m - 273.15
  t2m@units = "degC"

  lat  = t2m&latitude
  rad  = 4.0 * atan(1.0) / 180.0
  clat = cos(lat * rad)
  clat!0        = "latitude"
  clat&latitude = lat

  ts = wgt_areaave_Wrap(t2m, clat, 1.0, 0)
  ts@long_name = "Alan-agirlikli ortalama 2 m sicaklik"
  printVarSummary(ts)

  wks = gsn_open_wks("png", "t2m_areaave")
  res                  = True
  res@gsnMaximize      = True
  res@xyLineThicknessF = 3.0
  res@xyLineColor      = "firebrick"
  res@tiYAxisString    = "degC"
  res@tiXAxisString    = "gun"
  res@tiMainString     = "Turkiye kutusu alan ortalamasi"
  plot = gsn_csm_xy(wks, ispan(0, dimsizes(ts)-1, 1), ts, res)
end`,lineNotes:[{line:3,text:"Enlem dilimi {43:34} biçiminde AZALAN yazıldı: ERA5’in enlem ekseni 90’dan −90’a iner, dilim eksenin yönünü izlemelidir."},{line:7,text:"`&` koordinat erişim işlecidir: `t2m&latitude` değişkenin enlem eksenini döndürür."},{line:8,text:"Derece → radyan katsayısı. `4*atan(1)` π’nin tam hassasiyetli hâlidir; NCL’de hazır bir `pi` sabiti yoktur."},{line:9,text:"Ağırlık = cos(enlem). 60N’de bir ızgara kutusu ekvatordakinin yarısı kadar alan kaplar; ağırlık tam olarak bunu telafi eder."},{line:10,text:"Ağırlık dizisine boyut adı verir."},{line:11,text:"Ve koordinat değerlerini bağlar — `_Wrap` sürümünün eksenleri eşleştirebilmesi için gerekir."},{line:13,text:"`wgt_areaave_Wrap(x, wgty, wgtx, opt)`: enlem ağırlığı cos-lat, boylam ağırlığı 1.0 (boylamda kutular zaten eşit), opt=0 eksik değerleri yok sayar. Son iki boyut (lat, lon) ortalanır, zaman boyutu kalır."},{line:15,text:"`printVarSummary` değişkenin boyut, koordinat ve özniteliklerini konsola döker. NCL’de hata ayıklamanın birinci aracıdır."},{line:25,text:"`gsn_csm_xy` çizgi grafiği çizer; `ispan(0, n-1, 1)` 0’dan n−1’e tamsayı dizisi üretir."}],explain:["Küre üzerinde basit aritmetik ortalama yanlıştır: yüksek enlemlerdeki küçük kutular, ekvatordakilerle aynı ağırlığı alır ve ortalama kutba doğru kayar.","cos(φ) ağırlığı bu hatayı düzeltir çünkü bir ızgara kutusunun alanı R²·Δφ·Δλ·cos(φ) ile orantılıdır.","Türkiye kutusunda (34–43N) hata küçüktür (~%1), ama 30–70N gibi geniş bir kutuda ağırlıksız ortalama birkaç onda derece sapar — iklim serilerinde bu anlamlıdır.","`_Wrap` sürümü zaman koordinatını sonuca taşır; sonekisiz `wgt_areaave` çıplak dizi döndürür ve `gsn_csm_xy` eksen etiketi üretemez.","Sonuç bir zaman serisidir: mevsimsel salınım (yazın ~25 °C, kışın ~2 °C) ve üzerine binmiş sinoptik dalgalanmalar görünür.","`printVarSummary` adımını atlama alışkanlığı NCL’de en pahalı hatadır; boyut sırasını gözle doğrulamak beş saniye, yanlış eksende ortalama almak bir gün kaybettirir."],output:'Tek bir koyu kırmızı çizgi. Yatay eksen gün numarası (0–365), düşey eksen °C. Kışın 0–5 °C civarında başlayan eğri, yaza doğru 24–27 °C’ye tırmanır ve sonbaharda iner. Üzerine 3–10 günlük dalgalanmalar biner; büyük düşüşler soğuk hava dalgalarıdır. Konsolda ayrıca `printVarSummary` çıktısı: boyut adı "time", tip float.',pitfalls:["Enlem dilimini artan yazmak ({34:43}) ERA5 gibi azalan eksenli dosyalarda BOŞ dizi döndürür ve hata mesajı yanıltıcı olur.","`clat` dizisinin uzunluğu `t2m`in enlem boyutuyla birebir eşleşmelidir; dilimledikten SONRA hesaplamak bu yüzden önemlidir.","opt=1 verirsen NCL eksik değer olan zaman adımlarını tamamen atar; deniz/kara maskesi olan alanlarda bu sessizce serinin bir kısmını siler.","Ağırlığı `cos(lat)` yerine `cos(lat*rad)` yazmayı unutmak klasik hatadır: NCL trigonometri fonksiyonları RADYAN bekler, derece verirsen sonuç anlamsız salınır."],run:{script:`set lev surface
set gxout shaded
set cmap rdbu
set cint 1
set cbar on
set title 2 m sicaklik alan ortalamasindan sapma (K)
d t - mean(t)`,level:"surface",bridge:"Mini motorun `mean()` fonksiyonu görünen pencerenin alan ortalamasını verir — NCL’deki `wgt_areaave`in basitleştirilmiş kardeşidir (cos-lat ağırlığı uygulanmaz, dar bir pencerede fark ihmal edilebilir). Burada ortalamanın kendisini bir sayı olarak değil, ondan SAPMA haritası olarak görüyorsun; NCL örneği ise ortalamanın zaman serisini çizer."},level:2,tags:["alan ortalaması","wgt_areaave","cos-lat ağırlığı","zaman serisi"]}]},i={id:"ferret",title:"Ferret / PyFerret — eksen cebri ve dönüşümler",intro:'Ferret, NOAA/PMEL’de okyanus-atmosfer verisi için geliştirildi ve ayırt edici özelliği "eksen cebri"dir: bir değişkeni yazarken köşeli parantez içinde hangi eksende ne yapılacağını söylersin — `t[l=1:120@ave]` gibi. Ortalama, integral, maksimum, yeniden ızgaralama hepsi bu dönüşüm (`@`) dilinde ifade edilir; ara dosya üretmeden zincirleme hesap yapabilirsin. PyFerret ise aynı motoru Python’dan çağırır ve diziyi numpy olarak geri verir.',examples:[{id:"ferret-use-shade",title:"`USE` ile NetCDF aç, `SHADE` + `CONTOUR` bindir",lang:"ferret",goal:"Ferret’in temel iş akışını kurmak: dosyayı tanıt, bölgeyi seç, türetilmiş değişkeni çiz, üstüne izohat bindir.",data:"ERA5 basınç-seviyesi NetCDF (`era5_20240115.nc`); `z` jeopotansiyel (m²/s²).",code:`use "era5_20240115.nc"
show data
set region/x=15:50/y=25:55/z=500/l=1
let/units="m" gh = z / 9.80665
set variable/title="500 hPa jeopotansiyel yukseklik" gh
shade/levels=(5100,5880,60)/palette=rainbow gh
contour/overlay/levels=(5100,5880,60)/color=black/thickness=2 gh
go land
frame/file=gh500.png`,lineNotes:[{line:1,text:"`USE` dosyayı açar ve sıradaki veri kümesi yapar. Ferret aynı anda birden çok küme tutabilir; `USE` her seferinde yeni bir numara verir."},{line:2,text:"`SHOW DATA` dosyadaki değişkenleri, boyutlarını ve eksen aralıklarını listeler. Ferret’te ilk yazılacak ikinci komut budur — eksen adlarını ve sınırlarını öğrenmeden hiçbir şey yapma."},{line:3,text:"Çalışma bölgesi. X boylam, Y enlem, Z düşey, L zaman indeksi. Bundan sonraki her ifade bu pencerede değerlendirilir; GrADS’taki `set lat/lon/lev/t` ile birebir aynı mantık."},{line:4,text:"`LET` türetilmiş (hesaplanan) değişken tanımlar. Ferret bunu HEMEN hesaplamaz — tembeldir, ancak çizim ya da liste anında değerlendirir. `/UNITS` özniteliği eksene ve skalaya yansır."},{line:5,text:"`SET VARIABLE/TITLE` çizim başlığını değişkene bağlar; her `SHADE` çağrısında tekrar yazmaktan kurtarır."},{line:6,text:"Gölgeli çizim. `/LEVELS=(alt,üst,adım)` üç bileşenli standart biçimdir. `/PALETTE` renk dosyasını seçer (rainbow.spk)."},{line:7,text:"`/OVERLAY` mevcut çizimin üstüne biner, yeni eksen kurmaz. Aynı merdiveni vererek çizgileri renk sınırlarına oturturuz."},{line:8,text:'`GO land` Ferret ile gelen hazır bir betiktir (`land.jnl`): kıyı çizgilerini çizer. `GO` = "başka bir jnl dosyası çalıştır".'},{line:9,text:"Geçerli pencereyi dosyaya yazar. Biçim uzantıdan anlaşılır (png, gif, ps, pdf)."}],explain:['Ferret’te "bölge" (region) kavramı merkezîdir: bir kez kurarsın, sonraki tüm ifadeler onun içinde değerlendirilir. Bu, tekrar tekrar dilimleme yazmaktan kurtarır.',"`LET` tembel bir tanımdır, değişken değil bir FORMÜLDÜR. Bölgeyi değiştirip aynı `gh`yi tekrar çizersen yeni bölgede yeniden hesaplanır — NCL’in hemen hesaplayan yaklaşımından temel farkı budur.","ERA5’in `z` alanı jeopotansiyeldir; 9.80665’e bölmek Ferret’te de NCL’de de aynı zorunluluktur.","`SHADE` + `CONTOUR/OVERLAY` ikilisi, GrADS’taki iki geçişli `shaded` sonra `contour` tekniğinin Ferret karşılığıdır — renk hızlı tarar, çizgi kesin değer verir.",'`SHOW DATA` çıktısındaki eksen sınırlarını okumadan `SET REGION` yazmak, en sık görülen "boş çizim" nedenidir.'],output:'Gökkuşağı paletiyle boyanmış 500 hPa yükseklik haritası: kuzeyde mor/mavi (5200 m), güneyde kırmızı (5800 m). Üstünde 60 m aralıklı siyah izohatlar, `GO land` ile eklenmiş kıyı çizgileri. Sağda dikey renk skalası, üstte "500 hPa jeopotansiyel yukseklik" başlığı ve altında bölge/zaman damgası.',pitfalls:["`SET REGION/Z=500` ancak dosyanın düşey ekseni hPa birimindeyse çalışır; Pa ise 50000 yazman gerekir. `SHOW DATA` bunu söyler.","Ferret’te eksen sırası X,Y,Z,T sabittir ama dosyadaki sıra farklı olabilir; Ferret eşleştirmeyi eksen ADINDAN yapar, standart olmayan adlarda `DEFINE AXIS` gerekebilir.","`/OVERLAY` olmadan ikinci `CONTOUR` komutu yeni bir sayfa açar ve gölgeli çizimi kaybedersin.","`FRAME/FILE=` çağrılmadan betik biterse toplu (batch) kipte hiçbir dosya oluşmaz; `pyferret -nojnl -script x.jnl` koşularında bu satır zorunludur."],run:{script:`set lev 500
set gxout shaded+contour
set cmap nws
set cint 60
set cbar on
set title 500 hPa jeopotansiyel yukseklik (m)
d gh`,level:"500",bridge:"Ferret tarayıcıda koşmaz; sağdaki çizim aynı alanın YolHava mini motorundaki karşılığıdır — aynı veri, aynı 60 m merdiven, farklı çizici. Ferret’in `SET REGION` komutunun karşılığı mini motorda `set lev` + haritanın kendi görünüm penceresidir."},level:1,tags:["USE","SHADE","OVERLAY","SET REGION","NetCDF"]},{id:"ferret-let-theta",title:"`LET` ile türetilmiş değişken: potansiyel sıcaklık",lang:"ferret",goal:"Ham sıcaklıktan potansiyel sıcaklığı türetmek ve Ferret’in sözde-değişkenlerini (`Z[GZ=...]`) kullanmayı öğrenmek.",data:"ERA5 basınç seviyeleri; `t` (K), düşey eksen hPa.",code:`use "era5_20240115.nc"
set region/x=15:50/y=25:55/l=1
let pres = Z[GZ=t]
let/units="K" theta = t * (1000/pres)^0.2857
set variable/title="Potansiyel sicaklik" theta
shade/z=850/levels=(270,310,2)/palette=rainbow theta
contour/overlay/z=850/levels=(270,310,2)/color=black theta
go land
frame/file=theta850.png
list/z=850/x=29/y=41 t, pres, theta`,lineNotes:[{line:2,text:"Bölgeyi yatayda ve zamanda kurar; düşeyi BİLEREK açık bırakır, çünkü formülün her seviyede geçerli olmasını istiyoruz."},{line:3,text:'`Z[GZ=t]` bir sözde-değişkendir: "t değişkeninin düşey ekseni üzerindeki KOORDİNAT DEĞERLERİ" demektir. Yani her seviyede o seviyenin basıncını (hPa) veren bir alan üretir. Ferret’in en güçlü ve en az bilinen özelliklerinden biridir.'},{line:4,text:"Poisson denklemi: θ = T·(p0/p)^(R/cp), R/cp ≈ 0.2857. Formül tek satırda, her seviye için geçerli."},{line:6,text:"Çizim anında düşeyi tekleştiriyoruz: `/Z=850`. Bölgeyi değiştirmeye gerek yok, nitelik yeterli — Ferret’in komut-düzeyi eksen seçimi budur."},{line:7,text:"Aynı merdivenle izohat bindirir."},{line:10,text:"`LIST` sayıları konsola döker. Tek bir noktada (Ankara civarı) T, p ve θ’yi yan yana görmek, formülün doğru çalıştığını doğrulamanın en hızlı yoludur."}],explain:["Potansiyel sıcaklık, bir hava parselini kuru-adyabatik olarak 1000 hPa’a getirseydik sahip olacağı sıcaklıktır; adyabatik hareketlerde KORUNUR.","Korunumlu olduğu için θ, hava kütlelerini izlemenin doğru aracıdır: sıcaklık yükseldikçe düşer, θ ise aynı hava kütlesi boyunca sabit kalır.","`Z[GZ=t]` olmadan bu formülü yazmak için seviyeyi elle sabitlemek (850 gibi) gerekirdi ve formül tek seviyeye hapsolurdu.","Ferret’te `LET` tanımı tembeldir: `theta` bir dizi değil, bir kuraldır. `/Z=850` niteliği çizim anında kurala uygulanır ve yalnız o seviye hesaplanır — bellek açısından çok verimlidir.","θ’nin düşeyde artması kararlı, azalması kararsız katman demektir; bu tanım, meteorolojik kararlılık analizinin temelidir."],output:"850 hPa potansiyel sıcaklık haritası: 2 K aralıklı renk bantları, kuzeyde 275–285 K, güneyde 295–305 K. Üstünde aynı aralıkta siyah izoentropik çizgiler. Çizgilerin sıkıştığı kuşak cephe bölgesidir. Konsolda ayrıca üç sütunluk bir liste: T ≈ 278 K, pres = 850, theta ≈ 291 K gibi.",pitfalls:["Düşey eksen Pa birimindeyse `1000/pres` anlamsız olur; formülü `100000/pres` yapmak ya da ekseni hPa’ya çevirmek gerekir.","`Z[GZ=t]` içindeki değişken adı, düşey ekseni olan GERÇEK bir değişken olmalıdır; türetilmiş bir `LET` değişkeni verirsen Ferret ekseni çözemeyebilir.","Üs işleci Ferret’te `^`dır ve öncelik sırası beklediğinden farklı olabilir; parantezi cömertçe kullan.","`SET REGION` ile düşeyi kapatıp sonra `/Z=850` niteliği vermek çelişir: nitelik kazanır ama betiği okuyan kafası karışır. İkisinden birini seç."],run:{script:`set lev 850
set gxout shaded
set cmap magma
set cint 2
set cbar on
set title Potansiyel sicaklik (K) 850 hPa
d (t+273.15)*pow(1000/850,0.2857)`,level:"850",bridge:"Mini motorda `Z[GZ=t]` karşılığı yoktur: seviyeyi `set lev` ile zaten sabitlediğimiz için basıncı formüle elle (850) yazarız. Ayrıca mini motorun `t` alanı °C’dir, bu yüzden +273.15 eklenir. Matematik birebir aynı Poisson denklemidir."},level:2,tags:["LET","sözde-değişken","potansiyel sıcaklık","GZ","Poisson"]},{id:"ferret-plot-vs",title:"Eksen alt-kümesi ve `PLOT/VS` — hodograf",lang:"ferret",goal:"Tek bir noktada dikey rüzgâr yapısını iki biçimde görmek: u-v düzleminde hodograf ve basınca karşı hız profili.",data:"ERA5 `u`, `v`; Ankara yakını (32.9D, 39.9K), 1000–200 hPa.",code:`use "era5_20240115.nc"
set region/x=32.9/y=39.9/l=1
let/units="m/s" uz = u[z=1000:200]
let/units="m/s" vz = v[z=1000:200]
plot/vs/line/symbol=17/color=red/title="Ankara hodografi 1000-200 hPa" uz, vz
frame/file=hodograph.png
let/units="m/s" ws = (u^2 + v^2)^0.5
plot/z=1000:200/thickness=3/color=blue/title="Ruzgar hizi profili" ws
frame/file=wsprofile.png`,lineNotes:[{line:2,text:"X ve Y tek değere sabitlenir → yatay boyutlar düşer, geriye düşey eksen kalır. Ferret ara değer hesaplar; tam ızgara noktası vermek istersen `/X=32.75` gibi gerçek bir koordinat kullan."},{line:3,text:"Köşeli parantez içindeki `z=1000:200` eksen ALT-KÜMESİDİR: yalnız bu basınç aralığı. Ferret’te sınırların azalan yazılması (1000 → 200) eksenin kendi yönünü izler."},{line:5,text:'`PLOT/VS a, b`: birinci ifade yatay, ikinci düşey eksene gider. Ortak boyut (burada Z) noktaları sırayla birleştirir — hodografın tanımı budur. `/SYMBOL=17` her seviyeye bir işaret koyar, `/LINE` noktaları birleştirir; ikisi birlikte "hangi nokta hangi seviye" sorusunu okunur kılar.'},{line:6,text:"Birinci şekli diske yazar. Sonraki `PLOT` yeni bir sayfa açacağı için bu satır burada olmak zorundadır."},{line:7,text:"Rüzgâr hızı, yine tembel bir `LET` tanımı olarak."},{line:8,text:"Düşey boyutlu tek bir değişken `PLOT` edilince Ferret Z’yi DÜŞEY eksene koyar (profil geleneği). Bu davranış okyanus derinlik profillerinden gelir ve atmosferde de doğru sonucu verir."}],explain:["Hodograf, rüzgâr vektörünün ucunun yükseklikle çizdiği eğridir. Şekli doğrudan fiziksel bilgi taşır.","Eğri saat yönünde dönüyorsa (kuzey yarımkürede) sıcak advekasyon, saat yönünün tersine dönüyorsa soğuk advekasyon vardır — termal rüzgâr ilişkisinin görsel hâli.","Hodografın kapladığı alan, kayma (shear) ile ilgilidir; şiddetli konvektif fırtına potansiyeli değerlendirmesinde bu eğrinin şekli temel girdilerden biridir.","Ferret’te `[z=a:b]` bir dilim değil, bir eksen alt-kümesi ifadesidir ve `LET` kuralının içine gömülebilir; bu, aynı kuralı farklı aralıklarla yeniden kullanmaya izin verir.","`PLOT/VS` iki değişkeni birbirine karşı çizer; ortak eksen görünmez olur ama noktaların SIRASINI belirler. Bu yüzden T-p diyagramları, θ-e eğrileri ve hodograflar Ferret’te tek satırdır."],output:"İki ayrı şekil. Birincisi hodograf: yatay eksen u (−10…+40 m/s), düşey eksen v (−20…+20 m/s); kırmızı bir eğri orijin yakınından (yer rüzgârı zayıf) başlayıp sağ üste doğru açılır, her seviyede bir üçgen işaret. İkincisi profil: yatay eksen hız (0–70 m/s), düşey eksen basınç (altta 1000, üstte 200 hPa); mavi kalın çizgi 250–300 hPa civarında tepe yapar — jet seviyesi.",pitfalls:['`PLOT/VS` iki ifadenin AYNI ekseni paylaşmasını ister; biri Z diğeri T boyutluysa Ferret "incompatible axes" hatası verir.',"Tek bir X/Y noktası seçmek Ferret’te ara değer hesaplatır; ızgara noktasına oturmayan bir enlem/boylam, ince yapıları yumuşatır.","`z=1000:200` yerine `z=200:1000` yazmak bazı dosyalarda boş sonuç verir; eksen yönünü `SHOW DATA` ile doğrula.","Hodografı okurken eksenlerin ÖLÇEĞİ eşit değilse dönüş yönü doğru ama açı yanıltıcı görünür; karşılaştırma yapacaksan `/HLIMITS` ve `/VLIMITS` ile ölçeği sabitle."],run:{script:`set lev 500
set gxout barb
set cmap blues
set skip 3
set cbar on
set title 500 hPa ruzgar okları (barb)
d u ; v`,level:"500",bridge:"Mini motorda tek noktada dikey profil ya da hodograf çizilemez — zaman ve düşey eksen boyunca seri toplamaz. Buradaki barb haritası aynı rüzgâr alanının yatay görünümüdür: `set lev` satırını 925’ten 250’ye değiştirerek okların nasıl döndüğünü izlersen hodografın anlattığı dönmeyi harita üzerinde görürsün."},level:2,tags:["PLOT/VS","hodograf","eksen alt-kümesi","profil","shear"]},{id:"ferret-time-ave",title:"Zaman ortalaması ve anomali — `@AVE` dönüşümü",lang:"ferret",goal:"Ferret’in dönüşüm dilini öğrenmek: bir ekseni tek bir köşeli-parantez ifadesiyle ortalamak ve anomali üretmek.",data:"ERA5 850 hPa sıcaklık, bir aylık 6 saatlik dosya (124 zaman adımı).",code:`use "era5_t850_2024.nc"
set region/x=15:50/y=25:55/z=850
let/units="K" tmean = t[l=1:124@ave]
let/units="K" tanom = t[l=100] - tmean
set variable/title="850 hPa sicaklik anomalisi" tanom
shade/levels=(-12,12,2)/palette=centered tanom
contour/overlay/levels=(240,300,5)/color=black/thickness=2 tmean
go land
frame/file=t850_anom.png
list/x=29/y=41 tmean, t[l=100], tanom`,lineNotes:[{line:2,text:"Bölge yatayda ve düşeyde kurulur; ZAMAN bilerek açık bırakılır, çünkü zaman ekseni üzerinde işlem yapacağız."},{line:3,text:"`t[l=1:124@ave]`: L ekseninde 1–124 aralığını al ve `@AVE` dönüşümüyle ortala. Dönüşüm uygulanan eksen sonuçtan DÜŞER — geriye 2 boyutlu bir alan kalır. Ferret’in dönüşüm dilinin özü budur."},{line:4,text:"Anomali = tek bir adım eksi ortalama. `t[l=100]` yine eksen niteliğidir, ayrı bir değişken değil."},{line:6,text:"`centered` paleti ortası beyaz, uçları mavi/kırmızı olan ıraksayan bir renk dosyasıdır; anomali haritaları için doğru seçim."},{line:7,text:"Arka plana ortalamanın kendisi izohat olarak biner: anomali nereye oturuyor, bunu görmek için."},{line:10,text:"Tek noktada üç sayıyı yan yana yazar. Anomalinin gerçekten fark olduğunu (tanom = t[l=100] − tmean) gözle doğrularsın."}],explain:['Ferret’te `@` ile başlayan dönüşümler bir ekseni "tüketir": `@AVE` ortalar, `@SUM` toplar, `@MAX` en büyüğü alır, `@DIN` derinlik/yükseklik boyunca integre eder, `@DDC` merkezi türev alır.',"Dönüşüm ifadenin İÇİNE yazıldığı için ara dosya, ara değişken ve döngü gerekmez — bu, Ferret’i toplu analizde çok kısa tutan tasarım tercihidir.",'Ortalama bir "iklim" değil, dosyanın kendi ortalamasıdır. Gerçek iklim anomalisi için referans dosyası ayrı açılır (`USE` ikinci küme) ve `t[d=1] - tclim[d=2]` biçiminde yazılır.',"Anomali haritası bir hava dalgasının şiddetini ve coğrafi biçimini gösterir: dar bir dil mi, geniş bir kubbe mi? Bu şekil olayın ömrü hakkında ipucudur.","İki alanı birbirinden çıkarabilmek için eksenlerin AYNI olması gerekir; `@AVE` zaman eksenini düşürdüğü için çıkarma yayılma (broadcasting) ile sorunsuz çalışır."],output:"Mavi-beyaz-kırmızı bir sapma haritası: normale yakın alanlar beyaz kalır, soğuk dalga varsa Anadolu üzerinde −8…−12 K’lik koyu mavi bir kubbe, güneybatıda telafi eden ılık kırmızı alan. Üstünde 5 K aralıklı, ay ortalamasının siyah izotermleri; kıyı çizgileri. Konsolda tek noktanın üç sayısı.",pitfalls:["`l=1:124` dosyanın adım sayısını aşarsa Ferret uyarı verip kırpar; `SHOW DATA` ile gerçek L sınırını doğrula.","`@AVE` eksik değerleri atlar ama ağırlıklandırmaz; eşit olmayan zaman adımları varsa (örn. 3 saatlik ve 6 saatlik karışık) ortalama yanlıdır. O durumda `@AVE` yerine ağırlıklı toplam gerekir.","Dönüşümü köşeli parantezin DIŞINA yazmak (`t@ave`) sözdizimi hatasıdır; dönüşüm her zaman bir eksen niteliğine bağlanır.","Anomaliyi Celsius’a çevirmeye kalkışmak hatadır: iki Kelvin alanın farkı zaten Kelvin ve Celsius’ta aynı sayıdır."],run:{script:`set lev 850
set gxout shaded
set cmap rdbu
set cint 1
set cbar on
set title 850 hPa sicaklik alan ortalamasindan sapma (K)
d t - mean(t)`,level:"850",bridge:'Mini motorun zaman ekseni tek adımlıdır, `@AVE` karşılığı yoktur. Bu yüzden referans olarak ZAMAN ortalaması yerine ALAN ortalaması (`mean`) kullanılır. Fikir aynıdır — "ortalamadan sapma" — ama referansın hangi eksende alındığı farklıdır; okurken bunu hesaba kat.'},level:2,tags:["@AVE","dönüşüm","anomali","zaman ekseni"]},{id:"ferret-hovmoller",title:"Hovmöller diyagramı — boylam × zaman",lang:"ferret",goal:"Dalgaların doğuya ilerleyişini tek karede görmek: bir eksen coğrafya, diğeri zaman.",data:"ERA5 500 hPa zonal rüzgâr (`u`), 180 zaman adımlı dosya, 0–80D kuşağı.",code:`use "era5_u500_2024.nc"
set region/x=0:80/y=35:55/z=500/l=1:180
let/units="m/s" uhov = u[y=@ave]
set variable/title="500 hPa zonal ruzgar Hovmoller" uhov
shade/levels=(-10,50,5)/palette=centered uhov
contour/overlay/levels=(20,50,10)/color=black/thickness=2 uhov
frame/file=hovmoller_u500.png
list/x=30/l=1:10 uhov`,lineNotes:[{line:2,text:"Dört eksen de kurulur: X aralık, Y aralık, Z tek, L aralık. Şimdi Y’yi bir dönüşümle tüketeceğiz."},{line:3,text:"`u[y=@ave]` enlem ekseni boyunca ortalar ve o ekseni düşürür. Geriye (X, L) yani BOYLAM × ZAMAN kalır — Hovmöller diyagramının tam tanımı."},{line:5,text:'Ferret, iki boyutlu kalan ifadeyi otomatik olarak doğru eksenlere yerleştirir: X yatay, T düşey. Ayrıca "bunu Hovmöller çiz" demene gerek yoktur; şekil, hangi eksenlerin hayatta kaldığından doğar.'},{line:6,text:"Kuvvetli jet bandını (20–50 m/s) izohatla vurgular; eğik çizgiler dalganın ilerleme hızını verir."},{line:8,text:"İlk on zaman adımını tek bir boylamda listeler — eksenin gerçekten zaman olduğunu doğrulamanın en hızlı yolu."}],explain:['Hovmöller diyagramı, bir boyutu (burada enlem) ortalayıp yerine zamanı koyar; böylece hareketi "izleyebilirsin".',"Diyagramdaki eğik bantların EĞİMİ ilerleme hızıdır: 10 günde 40 derece boylam ≈ 4°/gün ≈ 3.7 m/s doğuya ilerleyen bir dalga.","Sağa (doğuya) eğik bantlar doğuya ilerleyen Rossby dalga paketleridir; neredeyse dikey bantlar duran (durağan) bir sırt ya da bloklama demektir.","Bloklama olayları Hovmöller’de en net görünen yapılardan biridir: haftalarca aynı boylamda duran, dikey bir düşük-rüzgâr sütunu.","Ferret’te çizim türünü komut değil, hayatta kalan eksenler belirler — bu, dilin en tutarlı tasarım kararıdır ve öğrendiğinde çok hızlanırsın."],output:"Yatay ekseni boylam (0–80D), düşey ekseni tarih olan dikdörtgen bir diyagram. Sarı-kırmızı bantlar (30–50 m/s) sağa eğik şeritler hâlinde yukarıdan aşağı akar; her şerit doğuya ilerleyen bir jet çekirdeğidir. Mavi alanlar zayıf/ters akıştır. Bir yerde şeritler dikleşip kalınlaşıyorsa orada bloklama vardır. Üstünde 10 m/s aralıklı siyah izohatlar.",pitfalls:["Enlem ortalaması alınan kuşak çok genişse (örn. 20–70N) farklı rejimler birbirini siler ve diyagram anlamsız bir bulanıklığa döner; 15–20 derecelik dar kuşaklar seç.","Zaman ekseni düzensizse (eksik adımlar) Ferret yine çizer ama düşey eksen yanıltıcı olur; eğimden hız okumadan önce adım aralığını doğrula.","`y=@ave` yerine `y=@sum` yazarsan değerler enlem sayısıyla çarpılır ve renk merdiveni tamamen kaçar.","X ekseni 0–360 dolanımlıysa (global dosya) 0 boylamında yapay bir kesik görünür; `SET AXIS/MODULO` ile dolanımı Ferret’e bildirmek gerekir."],run:{script:`set lev 500
set gxout shaded
set cmap rdbu
set cint 5
set cbar on
set title 500 hPa zonal ruzgar u (m/s)
d u`,level:"500",bridge:"DÜRÜST NOT: mini motor zaman ekseni boyunca biriktirme yapmaz, bu yüzden Hovmöller çizemez. Buradaki harita diyagramın TEK BİR SATIRIDIR (bir zaman adımı, tüm boylamlar). `set t 0`, `set t 6`, `set t 12` diye ilerleterek bandın doğuya kaydığını kare kare izleyebilirsin — Hovmöller bu karelerin üst üste yığılmış hâlidir."},level:3,tags:["Hovmöller","Rossby dalgası","bloklama","@AVE","zaman-boylam"]},{id:"ferret-pyferret",title:"PyFerret: Python’dan Ferret motorunu sürmek",lang:"python",goal:"Ferret’in eksen cebrini korurken sonucu numpy dizisi olarak Python’a almak — iki dünyanın iyi taraflarını birleştirmek.",data:"Aynı ERA5 dosyası; PyFerret kurulu bir ortam (`conda install -c conda-forge pyferret`).",code:`import numpy as np
import pyferret

pyferret.start(quiet=True, journal=False, unmapped=True)

pyferret.run('use "era5_20240115.nc"')
pyferret.run('set region/x=15:50/y=25:55/z=500/l=1')
pyferret.run('let gh = z / 9.80665')
pyferret.run('shade/levels=(5100,5880,60)/palette=rainbow gh')
pyferret.run('go land')
pyferret.run('frame/file=gh500.png')

res = pyferret.getdata('gh')
arr = np.ma.masked_invalid(res['data'])
lon = res['coords'][0]
lat = res['coords'][1]

print('bicim:', arr.shape)
print('en dusuk yukseklik:', float(arr.min()), 'm')
j, i = np.unravel_index(np.ma.argmin(arr), arr.shape)
print('cukur merkezi:', float(lon[j]), 'D', float(lat[i]), 'K')

pyferret.run('save/clobber/file=gh500.nc gh')
pyferret.stop()`,lineNotes:[{line:4,text:"Motoru başlatır. `unmapped=True` ekransız (headless) kipte çalıştırır — sunucuda ve toplu işte zorunludur. `journal=False` günlük dosyası üretmesini engeller."},{line:6,text:"`pyferret.run` bir Ferret komutunu olduğu gibi gönderir. Yani `.jnl` betiğindeki her satırı buradan da verebilirsin."},{line:8,text:"Aynı `LET` tanımı; Ferret motorunda yaşar, Python tarafında henüz bir dizi yoktur."},{line:9,text:"Çizimi Ferret yapar — yayın kalitesi Ferret’ten, akış denetimi Python’dan."},{line:13,text:"`getdata` türetilmiş değişkeni hesaplatır ve bir sözlük döndürür: `data` (numpy dizisi), `coords` (eksen değerleri demeti), `axis_units`, `axis_names`, `missing_value`, `title`."},{line:14,text:"Eksik değerler NaN olarak gelir; maskeli dizi yapmak min/max hesabını güvenli kılar."},{line:15,text:"`coords` demeti Ferret eksen sırasındadır: X, Y, Z, T, E, F. Yani sıfırıncı eleman BOYLAM, birinci eleman ENLEMDİR."},{line:18,text:"Dizinin biçimi de aynı sıradadır: (nx, ny, ...). numpy alışkanlığıyla (lat, lon) beklemek burada hataya götürür."},{line:21,text:"En düşük yüksekliğin ızgara indeksleri; çukurun merkezini bulur."},{line:23,text:"`SAVE/CLOBBER/FILE=` türetilmiş değişkeni NetCDF olarak diske yazar. `clobber` varsa üzerine yazar."},{line:24,text:"Motoru kapatır. Aynı süreçte yeniden `start` çağırmak desteklenmez; betik başına bir kez."}],explain:["PyFerret, Ferret motorunu bir Python kütüphanesi olarak paketler: komut dili aynen korunur, veri alışverişi numpy üzerinden olur.","Kazanç şudur: eksen cebri ve dönüşümler (`@AVE`, `@DIN`, yeniden ızgaralama) Ferret’te tek satırdır; döngü, dosya gezinme, istatistik ve makine öğrenmesi ise Python’da doğaldır.","Tipik kullanım deseni: ağır ızgara işini `pyferret.run` ile Ferret’e yaptır, sonucu `getdata` ile çek, Python’da analiz et.","`putdata` ile ters yön de mümkündür: Python’da hesapladığın bir diziyi Ferret’e geri verip onun çizim motoruyla basabilirsin.",'Eksen sırası farkı (Ferret X,Y,Z,T vs numpy’ın satır-öncelikli alışkanlığı) bu köprünün en önemli ayrıntısıdır; `res["axis_names"]` yazdırarak her seferinde doğrula.','Headless kipte (`unmapped=True`) `FRAME/FILE=` çağrılmadan hiçbir görsel üretilmez — betik sessizce biter ve "çizim nerede" sorusu doğar.'],output:"Diskte `gh500.png` (Ferret’in çizdiği 500 hPa haritası) ve `gh500.nc` (türetilmiş alan). Konsolda dört satır: dizi biçimi (örn. (141, 121)), en düşük yükseklik (örn. 5187.4 m) ve çukur merkezinin boylam/enlem koordinatları. Hata olursa Ferret’in kendi mesajı Python istisnası değil, konsola basılan bir metin olarak gelir.",pitfalls:["`pyferret.start()` çağrılmadan `run` kullanmak sessiz bir çökme üretir; başlatma her zaman ilk satır olmalıdır.",'`unmapped=True` verilmezse sunucuda X11 penceresi açmaya çalışır ve "cannot open display" ile durur.',"`getdata` sözlüğündeki `coords` demeti Ferret eksen sırasındadır; numpy alışkanlığıyla `coords[0]`i enlem sanmak, harita üzerinde koordinatları yer değiştirmiş bir sonuç verir.",'Ferret komut hataları Python istisnası fırlatmaz — `pyferret.run` dönüş değerini denetlemezsen betik "başarıyla" biter ama hiçbir şey hesaplanmamıştır.'],run:{script:`set lev 500
set gxout shaded
set cmap nws
set cint 60
set cbar on
set title 500 hPa jeopotansiyel yukseklik (m)
d gh`,level:"500",bridge:"Ne PyFerret ne de Ferret motoru tarayıcıda koşar. Sağdaki çizim, soldaki Python betiğinin ürettiği `gh500.png` dosyasının YolHava mini motorundaki karşılığıdır: aynı alan, aynı 60 m merdiven, farklı çizici ve canlı veri. Python tarafındaki numpy analizi (en düşük yükseklik, çukur merkezi) mini motorda `minv(gh)` ifadesiyle kabaca izlenebilir."},level:3,tags:["PyFerret","Python","getdata","numpy","köprü"]}]},r=[e,a,i];export{r as EXAMPLES_A};
