const a={id:"linux-tools",title:"Linux ve Araç Zinciri",intro:"Sayısal hava tahmininde işin yarısı fizik, yarısı ise dosya taşımaktır. Model kodu bir kümede koşar, çıktısı yüzlerce GRIB dosyasına düşer, siz o yığından tek bir alanı çekip kesip ortalamasını almak istersiniz. Bu bölüm o ikinci yarıyı öğretir: meteoroloğun neden Linux kullandığını, kabuğun nasıl düşündüğünü, metni ve ızgarayı işleyen klasik araçları, betikle otomasyonu, iş kuyruğunu ve bir veri işini uçtan uca kurmayı. Amaç ezber değil: bir daha aynı işi elle yapmayacak kadar iyi yazılmış birkaç satır bırakmak.",sections:[{id:"neden-linux",title:"Meteorolog neden Linux kullanır",lead:"Model kodları, veri araçları ve kümelerin tamamı Linux üzerinde yaşar. Sebep moda değil: iş uzakta koşar, betikle sürülür ve bir yıl sonra aynı sonucu vermesi beklenir.",blocks:[{k:"p",text:"Bir tahmin merkezinde çalıştığınızı düşünün. WRF ya da ICON kaynak kodunu derleyeceksiniz; derleyici, MPI kütüphanesi, NetCDF ve HDF5 kütüphaneleri hepsi Unix dünyasında paketlenmiştir. Koşuyu bir kümede başlatacaksınız; kümenin giriş kapısı bir kabuktur. Çıktıyı işleyeceksiniz; `wgrib2`, `cdo`, `ncks` gibi araçlar komut satırından çağrılmak üzere tasarlanmıştır. Linux burada bir tercih değil, zincirin kendisidir."},{k:"list",items:["**Model kodları oradadır.** WRF, MPAS, ICON, GFS/UFS, ROMS, SWAN: derleme betikleri Unix varsayar.","**İş uzakta koşar.** Veri terabaytlarca; onu kendi bilgisayarınıza indirmezsiniz, hesabı verinin yanına götürürsünüz.","**Otomasyon doğal gelir.** Fareyle yaptığınız iş tekrar edilemez; bir betik tekrar edilebilir ve `cron` ile saat başı koşar.","**Yeniden üretilebilirlik.** Komutlar metindir: sürüm kontrolüne girer, makaleye ek olarak konur, üç yıl sonra tekrar koşar.","**Metin araçları evrenseldir.** METAR, SYNOP, istasyon CSV’si, model günlüğü — hepsi metin; `grep`/`awk` bunlar için doğmuştur."]},{k:"table",caption:"Aynı iş, iki dünyada",head:["İş","Masaüstü alışkanlığı","Linux karşılığı","Kazanç"],rows:[["1 dosyayı kesmek","Programı aç, menüden seç","`cdo sellonlatbox,... in.nc out.nc`","Aynı"],["400 dosyayı kesmek","400 kez tıkla","Aynı komut bir `for` döngüsünde","Dakikalar"],["Her gün 06Z’de indirmek","Hatırlamak","`cron` girdisi","Unutma riski yok"],["Bir yıl sonra tekrarlamak","“Galiba şöyle yapmıştım”","Betik dosyası + git geçmişi","Kanıt"],["Meslektaşa anlatmak","Ekran görüntüsü","12 satırlık betik","Kopyala-çalıştır"]]},{k:"p",text:"Gerçek çalışma biçimi şudur: siz kendi bilgisayarınızda oturursunuz, işin kendisi yüzlerce kilometre ötedeki bir sunucuda koşar. Aradaki köprü `ssh` (güvenli kabuk) ve oturumu kopmaya karşı koruyan `tmux`/`screen`’dir."},{k:"code",lang:"bash",title:"Uzak sunucuya bağlanmak ve oturumu korumak",code:`ssh ali@sunucu.meteoroloji.local
ssh -i ~/.ssh/id_ed25519 -p 2222 ali@10.0.3.12
tmux new -s gfs
tmux ls
tmux attach -t gfs
scp rapor.pdf ali@sunucu:/home/ali/cikti/
rsync -avh --progress ./kodum/ ali@sunucu:/home/ali/kodum/
nohup ./uzun_is.sh > is.log 2>&1 &`,notes:[{line:1,text:"En yalın biçim: kullanıcı@makine. Parola yerine anahtar kullanmak hem hızlı hem güvenlidir."},{line:2,text:"`-i` özel anahtar dosyasını, `-p` standart dışı kapı numarasını belirtir."},{line:3,text:"`gfs` adında yeni bir tmux oturumu açar. Bundan sonra çalıştırdığınız her şey o oturumun içinde yaşar."},{line:4,text:"Açık oturumları listeler. Sunucuya yarın bağlandığınızda hangi işin sürdüğünü buradan görürsünüz."},{line:5,text:"Oturuma geri döner. Oturumdan çıkmadan ayrılmak için Ctrl-b tuşlarına, ardından d tuşuna basılır."},{line:6,text:"`scp` tek dosya kopyalar; küçük işler için yeterlidir."},{line:7,text:"`rsync` yalnız değişeni gönderir, yarıda kalan aktarımı sürdürür. Dizin sonundaki `/` önemlidir: dizinin *içeriğini* gönderir."},{line:8,text:"tmux yoksa acil çözüm: `nohup` ile süreç oturumdan bağımsızlaşır, `&` arka plana atar, çıktı dosyaya düşer."}]},{k:"note",tone:"trap",text:"Uzun süren bir işi düz `ssh` oturumunda başlatıp ağ koparsa iş de ölür. Yarım kalmış bir model koşusu ya da 40 GB’lık yarım indirme ile uyanırsınız. Kural: **bir dakikadan uzun sürecek her şey `tmux` içinde başlatılır.**"},{k:"p",text:"Küme (cluster) ortamında bir adım daha vardır: işi doğrudan çalıştırmazsınız, **kuyruğa** verirsiniz. SLURM ve PBS bu kuyruk yöneticilerinin yaygın olanlarıdır. Siz bir betik yazıp “bana 4 düğüm, 2 saat ver” dersiniz; sistem sıra gelince işinizi başlatır. Ayrıntısı bu bölümün HPC kısmında."},{k:"note",tone:"trap",text:"Kümenin **giriş düğümü** (login node) herkesin ortak kapısıdır. Orada `cdo` ile 300 dosya işlemeye kalkmak, onlarca kişinin bağlantısını yavaşlatır ve sistem yöneticisinden mail almanıza yol açar. Ağır iş kuyruğa gider; giriş düğümü yalnız dosya düzenlemek ve iş göndermek içindir."},{k:"p",text:"Öğrenci için pratik yol: Windows’tan vazgeçmeden Linux kullanmak. WSL (Windows Subsystem for Linux) gerçek bir Ubuntu çekirdeği çalıştırır; `apt` ile `cdo`, `wgrib2`, `nco` kurulur ve komutlar sunucudakiyle birebir aynı davranır."},{k:"code",lang:"bash",title:"WSL ile Windows üzerinde Linux",code:`wsl --install -d Ubuntu-22.04
wsl -l -v
wsl -d Ubuntu-22.04
sudo apt update && sudo apt install -y cdo nco netcdf-bin jq
cdo -V
ls /mnt/c/Users/ali/Desktop
cp /mnt/c/Users/ali/Desktop/veri.grb2 ~/veri/`,notes:[{line:1,text:"PowerShell’de çalıştırılır; dağıtımı indirir ve kurar. Bir kez yapılır."},{line:2,text:"Kurulu dağıtımları ve WSL sürümünü listeler; WSL 2 olduğundan emin olun."},{line:4,text:"Paket yöneticisiyle araç zincirinin çekirdeği kurulur. `netcdf-bin` içinden `ncdump` gelir."},{line:5,text:"Kurulum doğrulaması: CDO sürümünü ve derlendiği kütüphaneleri basar."},{line:6,text:"Windows diski Linux tarafında `/mnt/c` altında görünür; iki dünya arasında dosya taşımak böyle olur."}]},{k:"note",tone:"trap",text:"WSL içinde `/mnt/c` üzerinde çalışmak **çok yavaştır**; dosya sistemi köprüsü her okumada bedel öder. Binlerce GRIB dosyasını `/mnt/c/...` altında işlerseniz işin saatlerce sürdüğünü görürsünüz. Veriyi Linux’un kendi ev dizinine (`~/veri`) kopyalayıp orada çalışın."}]},{id:"kabuk",title:"Kabuk: dosyalar, izinler, borular",lead:"Kabuk bir program başlatıcıdan ibaret değildir; küçük araçları birbirine bağlayan bir dildir. Bu bölüm o dilin dilbilgisidir.",blocks:[{k:"p",text:"Linux’ta her şey tek bir ağaçta durur. Tepede `/` (kök) vardır; sürücü harfi yoktur. Nerede olduğunuzu `pwd` söyler, listeyi `ls` verir, yer değiştirmeyi `cd` yapar. Bu üçlü, kabukta geçireceğiniz zamanın büyük kısmını kaplar."},{k:"code",lang:"bash",title:"Nerede olduğumu bilmek",code:`pwd
ls
ls -l
ls -lh --sort=time
ls -ld /work/gfs
cd /work/gfs/2026091600
cd ..
cd -
cd`,notes:[{line:1,text:"Bulunduğunuz dizini mutlak yol olarak basar, ör. `/home/ali`."},{line:3,text:"Uzun liste: izinler, sahip, grup, bayt cinsinden boyut, değişim tarihi."},{line:4,text:"`-h` boyutu insan okur biçime çevirir (412M gibi), `--sort=time` en yeniyi başa alır — indirmenin bittiğini böyle görürsünüz."},{line:5,text:"`-d` dizinin *içeriğini* değil kendisini gösterir; izinlerini denetlerken şarttır."},{line:7,text:"`..` bir üst dizin. `.` ise bulunduğunuz dizin."},{line:8,text:"Bir önceki dizine geri sıçrar; iki dizin arasında mekik dokurken çok işe yarar."},{line:9,text:"Argümansız `cd` sizi ev dizinine (`~`) götürür."}]},{k:"table",caption:"Meteoroloji sunucusunda tanıdık dizinler",head:["Yol","Ne için","Dikkat"],rows:[["`/home/ali`","Betikler, küçük dosyalar, ayarlar","Kotası küçüktür; veri koymayın"],["`/work` veya `/scratch`","Model çıktısı, ara ürünler","Hızlı ve büyüktür; **yedeklenmez**"],["`/tmp`","Geçici dosya","Makine yeniden başlayınca silinir"],["`/usr/local/bin`","Elle derlenmiş araçlar (`wgrib2` sık buradadır)","Yazmak için yetki gerekir"],["`/opt` veya `/apps`","Merkezî kurulu yazılım, `module` ile açılır","Sürüm seçimi buradan yapılır"]]},{k:"code",lang:"bash",title:"Mutlak yol, göreli yol ve dosya işleri",code:`mkdir -p ~/proje/gfs/2026091600/ham
cd ~/proje/gfs/2026091600
cp ham/gfs.t00z.pgrb2.0p25.f006 .
cp -r ham yedek_ham
mv gfs.t00z.pgrb2.0p25.f006 f006.grb2
mv *.grb2 ham/
rm f012.grb2
rm -r yedek_ham
ln -s /scratch/ali/gfs veri`,notes:[{line:1,text:"`-p` ara dizinleri de açar ve dizin zaten varsa hata vermez; betiklerde her zaman `-p` kullanın."},{line:2,text:"`~` ev dizininin kısaltmasıdır: `/home/ali` yerine geçer."},{line:3,text:"Göreli yol (`ham/...`) bulunduğunuz dizine göre okunur; hedefteki `.` “burası” demektir."},{line:4,text:"Dizini kopyalamak için `-r` (özyinelemeli) gerekir."},{line:5,text:"`mv` hem taşır hem yeniden adlandırır; ikisi aynı işlemdir."},{line:6,text:"Joker karakter kabuk tarafından açılır: komut çalışmadan önce liste hâline gelir."},{line:9,text:"Sembolik bağ: büyük veriyi ev dizinine kopyalamadan, kısa bir adla erişilir kılar."}]},{k:"note",tone:"trap",text:"`rm` sildiğini geri dönüşüm kutusuna koymaz; dosya gider. `mv` ise hedefte aynı adlı dosya varsa **sormadan üzerine yazar**. Kritik dizinlerde `cp -i` / `mv -i` alışkanlığı edinin; toplu silmeden önce aynı deseni önce `ls` ile çalıştırıp gözünüzle görün."},{k:"p",text:"Her dosyanın bir sahibi, bir grubu ve üç kümeden oluşan izinleri vardır: sahip (user), grup (group), diğerleri (other). Her küme için okuma (r), yazma (w) ve çalıştırma (x) hakkı ayrı ayrı tutulur. `ls -l` çıktısındaki `-rwxr-xr--` dizisi tam olarak bunu gösterir."},{k:"code",lang:"bash",title:"İzinleri okumak ve değiştirmek",code:`ls -l indir_gfs.sh
# -rw-r--r-- 1 ali meteo 1843 Sep 16 09:12 indir_gfs.sh
chmod 755 indir_gfs.sh
./indir_gfs.sh
chmod 600 ~/.netrc
chmod -R g+rX /work/ali/paylasim
chown ali:meteo cikti.nc
umask 022`,notes:[{line:2,text:"İlk karakter tür (`-` dosya, `d` dizin, `l` bağ). Sonra 3’erli üç küme: sahip `rw-`, grup `r--`, diğerleri `r--`. Yani betik henüz çalıştırılabilir değil."},{line:3,text:"7 = 4+2+1 (oku+yaz+çalıştır) sahip için; 5 = 4+1 grup ve diğerleri için. Betikler için standart değer."},{line:4,text:"Baştaki `./` şarttır: kabuk, aksi hâlde komutu yalnız `PATH` içinde arar."},{line:5,text:"Parola/anahtar taşıyan dosya yalnız sahibine açık olmalıdır; 600 tam olarak budur."},{line:6,text:"Büyük `X` yalnız dizinlere ve zaten çalıştırılabilir olanlara `x` ekler; veri dosyalarını yanlışlıkla çalıştırılabilir yapmaz."},{line:8,text:"`umask 022` yeni dosyaların varsayılan izinlerini belirler: sahip yazar, diğerleri okur."}]},{k:"table",caption:"chmod sayısal gösterimi",head:["Rakam","Açılımı","Anlamı","Tipik kullanım"],rows:[["7","rwx (4+2+1)","Oku, yaz, çalıştır","Sahibin betiği"],["6","rw- (4+2)","Oku, yaz","Veri dosyası, sahip"],["5","r-x (4+1)","Oku, çalıştır","Ortak kullanılan betik"],["4","r-- (4)","Yalnız oku","Salt okunur çıktı"],["0","---","Hiçbir hak","Gizli dosyada “diğerleri”"],["755","rwxr-xr-x","Sahip her şey, diğerleri okur/çalıştırır","Betik ve dizin"],["644","rw-r--r--","Sahip yazar, diğerleri okur","Metin/veri dosyası"],["600","rw-------","Yalnız sahip","Anahtar, `.netrc`, parola"]]},{k:"p",text:"Joker karakterler (`*`, `?`, `[...]`, `{...}`) kabuk tarafından **komut çalışmadan önce** genişletilir; araç yalnız hazır listeyi görür. Ağaç içinde arama gerektiğinde ise `find` devreye girer: ölçüte uyan dosyaları bulur ve isterseniz her biri için komut çalıştırır."},{k:"code",lang:"bash",title:"Joker karakterler ve find",code:`ls gfs.t00z.pgrb2.0p25.f0*
ls gfs.t00z.pgrb2.0p25.f0[0-2][0-9]
echo f{000..024..6}
find /work/ali -name "*.grb2"
find /work/ali -name "*.grb2" -mmin -120
find /work/ali -type f -size +1G -printf "%s %p\\n" | sort -rn | head
find /work/ali -name "*.tmp" -mtime +7 -delete
find /work/ali -name "*.nc" -print0 | xargs -0 -n1 -P4 ncdump -h`,notes:[{line:1,text:"`*` sıfır ya da daha çok karakter. Bu kalıp f000–f099 arasını yakalar."},{line:2,text:"Köşeli parantez karakter kümesi: f000–f029 arası dosyalar."},{line:3,text:"Küme parantezi *sayı üretir* (dosya var olmasa da): f000 f006 f012 f018 f024. Döngülerde çok kullanışlıdır."},{line:4,text:"Tırnak burada zorunludur: tırnaksız yazarsanız kabuk deseni önce kendisi açar ve `find` yanlış argüman alır."},{line:5,text:"`-mmin -120` son 120 dakikada değişenler; yeni inen koşuyu ayıklamanın en kısa yolu."},{line:6,text:"1 GB’dan büyük dosyaları boyutuyla basar, sıralar; disk kotası dolduğunda ilk bakılacak komut."},{line:7,text:"`-delete` bulduğunu siler. Önce `-delete` olmadan çalıştırıp listeyi görmeden asla kullanmayın."},{line:8,text:"`-print0`/`-0` ikilisi boşluklu adları korur; `-P4` dört dosyayı aynı anda işler."}]},{k:"note",tone:"trap",text:"Joker karakterin kim tarafından açıldığını karıştırmak klasik hatadır. `find . -name *.nc` (tırnaksız) bulunduğunuz dizinde tek bir `.nc` varsa çalışır, iki tane varsa “paths must precede expression” hatası verir — yani bazen çalışıp bazen çalışmaz. Deseni **daima tırnak içine** alın."},{k:"p",text:"Her programın üç akışı vardır: standart girdi (0), standart çıktı (1) ve standart hata (2). Yönlendirme bu akışları dosyaya bağlar, boru ise bir programın çıktısını diğerinin girdisine takar. Unix’in asıl gücü buradadır: küçük araçlar tek başına sıradan, zincir hâlinde güçlüdür."},{k:"code",lang:"bash",title:"Yönlendirme, boru, xargs ve çıkış kodu",code:`wgrib2 gfs.t00z.pgrb2.0p25.f006 > envanter.txt
echo "$(date -u) koşu başladı" >> gunluk.log
cdo timmean girdi.nc ort.nc > cdo.log 2>&1
ncdump -h veri.nc 2> /dev/null | grep -c "float"
grep ":HGT:500 mb:" envanter.txt | wc -l
cut -d: -f4 envanter.txt | sort -u | head -20
ls *.grb2 | xargs -n1 -P4 -I{} wgrib2 {} -netcdf {}.nc
echo $?
test -s ort.nc && echo "ortalama üretildi" || echo "DOSYA BOŞ"`,notes:[{line:1,text:"`>` standart çıktıyı dosyaya yazar ve **dosyayı sıfırlar**. Envanteri böyle saklarız."},{line:2,text:"`>>` sonuna ekler; günlük dosyaları hep böyle büyür."},{line:3,text:"`2>&1` standart hatayı standart çıktının gittiği yere yollar. Sıra önemlidir: önce `>` ile hedef belirlenir, sonra 2 oraya bağlanır."},{line:4,text:"`2> /dev/null` hataları çöpe atar; `|` ile çıktı `grep`e akar, `-c` eşleşme sayısını verir."},{line:5,text:"Envanterde 500 hPa yükseklik kaç mesajda geçiyor? Zincirle tek satırda cevap."},{line:6,text:"wgrib2 envanteri iki nokta ile ayrılmış alanlardan oluşur; 4. alan değişken adıdır. `sort -u` tekilleştirir."},{line:7,text:"`-I{}` her satırı `{}` yerine koyar; `-P4` dört işi koşut çalıştırır. Toplu dönüştürmenin en kısa yolu."},{line:8,text:"`$?` son komutun çıkış kodudur: 0 başarı, 0 dışında her şey hata. Betikte karar bunun üzerine kurulur."},{line:9,text:"`&&` yalnız başarıda, `||` yalnız hatada çalışır. `test -s` dosyanın var **ve boş olmadığını** denetler."}]},{k:"note",tone:"trap",text:"Boru hattının çıkış kodu varsayılan olarak **son** komuttan gelir. `wgrib2 yok.grb2 | wc -l` zinciri, wgrib2 çökse bile 0 döner çünkü `wc` mutlu bitmiştir. Betiklerde bu yüzden `set -o pipefail` kullanılır; ayrıntısı betik bölümünde."}]},{id:"metin-araclari",title:"Metin araçları: grep, sed, awk, jq",lead:"Meteorolojik verinin büyük kısmı hâlâ satır satır metindir: METAR, istasyon CSV’si, model günlüğü, GRIB envanteri. Bu dört araç o metni saniyeler içinde sayıya çevirir.",blocks:[{k:"p",text:"`grep` satır seçer, `sed` satırı değiştirir, `awk` sütunla hesap yapar, `jq` JSON’u gezer. Dördü de girdisini satır akışı olarak okur; dosya belleğe sığmasa da çalışırlar. Bu yüzden 10 GB’lık bir günlük dosyası bunlar için sorun değildir."},{k:"code",lang:"bash",title:"grep: satır avlamak",code:`grep "LTBA" metar_2026091612.txt
grep -i "thunderstorm" tafs.txt
grep -c "TS" metar_gun.txt
grep -n "ERROR" rsl.error.0000
grep -v "^#" ayarlar.conf
grep -E "^(LTBA|LTFM|LTAI) " metar_gun.txt
grep -E "[0-9]{2}(0[5-9]|[1-9][0-9])KT" metar_gun.txt
grep -r "wrfout" ~/betikler/
grep -A2 -B2 "SIGMET" uyarilar.txt`,notes:[{line:1,text:"En yalın kullanım: içinde LTBA (İstanbul Atatürk) geçen satırları basar."},{line:2,text:"`-i` büyük/küçük harf ayrımını kaldırır."},{line:3,text:"`-c` satırları basmaz, sayar. Gök gürültülü rapor sayısını böyle alırsınız."},{line:4,text:"`-n` satır numarasını ekler; WRF hata günlüğünde hatanın yerini bulmak için."},{line:5,text:"`-v` eşleşmeyenleri seçer; `^#` başında diyez olan satır demektir, yani yorumları atar."},{line:6,text:"`-E` genişletilmiş düzenli ifade açar: parantez ve `|` ile “şunlardan biri” kurulur. Sondaki boşluk, LTBA ile başlayan başka kodları elemek içindir."},{line:7,text:"Rüzgâr hızı 05 kt ve üzeri olan METAR grupları: iki basamak yön, sonra hız, sonra KT."},{line:8,text:"`-r` dizin ağacında arar; “bu değişkeni hangi betikte kullanmıştım” sorusunun cevabı."},{line:9,text:"Eşleşen satırın 2 alt ve 2 üst satırını da gösterir; bağlam gerektiren günlüklerde şart."}]},{k:"table",caption:"Düzenli ifade çekirdeği (grep -E, sed -E, awk)",head:["Kalıp","Anlamı","Meteorolojik örnek"],rows:[["`^`","Satır başı","`^LTB` — istasyon kodu satır başında"],["`$`","Satır sonu","`=$` — METAR sonlandırıcısı"],["`.`","Herhangi bir karakter","`LT..` — dört harfli Türkiye kodları"],["`[0-9]`","Rakam kümesi","`[0-9]{4}KT` biçimindeki rüzgâr"],["`*` / `+` / `?`","0+ / 1+ / 0 ya da 1 tekrar","`SHRA+` — bir ya da çok"],["`{n,m}`","n ile m arası tekrar","`[0-9]{3}` — üç basamaklı yön"],["`|`","Ya da","`TS|GR|FZRA` — tehlikeli hava"],["`\\\\.`","Gerçek nokta","`\\\\.nc$` — NetCDF dosya adı"]]},{k:"note",tone:"trap",text:"Düz `grep` eski (temel) düzenli ifade kullanır: orada `+`, `?`, `{}` ve `|` özel değildir, ters eğik çizgiyle kaçırmak gerekir. `grep -E` yazmayı alışkanlık hâline getirin. Ayrıca `.` her karakteri karşılar; nokta ararken `\\.` yazmazsanız `data_nc` de eşleşir."},{k:"p",text:"`sed` akış düzenleyicisidir: her satırı alır, üzerinde bir kural uygular, bırakır. En çok kullanılan iş değiştirmedir (`s/eski/yeni/`), ama satır seçmek ve silmek de yapar. Ayar dosyası üretmek (namelist.input gibi) için biçilmiş kaftandır."},{k:"code",lang:"bash",title:"sed: satırı dönüştürmek",code:`sed -n '1,5p' istasyon.csv
sed '1d' istasyon.csv > govde.csv
sed 's/,/\\t/g' istasyon.csv > istasyon.tsv
sed 's/YYYYMMDD/20260916/g' namelist.input.sablon > namelist.input
sed -i.bak 's/max_dom *= *1/max_dom = 2/' namelist.input
sed -n '/LTBA/,/LTFM/p' metar_gun.txt
sed -E 's/ +/ /g' hizali_cikti.txt
sed 's/\\r$//' windows_dosyasi.csv > temiz.csv`,notes:[{line:1,text:"`-n` kendiliğinden basmayı kapatır, `p` yalnız seçileni bastırır: ilk 5 satır, yani başlık kontrolü."},{line:2,text:"İlk satırı (başlığı) siler; CSV’yi sayısal araca vermeden önce sık gerekir."},{line:3,text:"`g` satırdaki *tüm* eşleşmeleri değiştirir; `g` yoksa yalnız ilki değişir."},{line:4,text:"Şablondan gerçek ayar dosyası üretmenin en temiz yolu: şablonu bozmadan yeni dosya yazar."},{line:5,text:"`-i` dosyanın kendisini değiştirir; `.bak` uzantısı orijinali `namelist.input.bak` olarak saklar."},{line:6,text:"İki desen arasındaki satır aralığını basar; uzun günlükten bir bölüm çekmek için."},{line:7,text:"Art arda boşlukları teke indirir — sabit genişlikli çıktıyı sütunlara ayırmadan önce."},{line:8,text:"Windows’tan gelen dosyalardaki satır sonu taşıma karakterini (CR) atar."}]},{k:"note",tone:"trap",text:"`sed -i` yedeksiz kullanıldığında geri dönüş yoktur; yanlış bir desenle 200 satırlık `namelist.input` bir anda bozulabilir. Alışkanlık: önce `-i` olmadan çalıştırıp çıktıya bakın, sonra `-i.bak` ile uygulayın. (Not: BSD/macOS `sed`’inde `-i` uzantıyı zorunlu ister; aynı komut Linux’ta çalışıp orada patlayabilir.)"},{k:"p",text:"`awk` bu dörtlünün en güçlüsüdür: her satırı alanlara böler (`$1`, `$2`, ...), koşul uygular ve birikim yapar. Bir istasyon dosyasından günlük maksimumu çıkarmak, kolon ortalaması almak, birim çevirmek — hepsi tek satırda biter."},{k:"code",lang:"bash",title:"awk: sütunla hesap",code:`awk '{print $1, $3}' metar_gun.txt
awk '$1 == "LTBA" {print}' metar_gun.txt
awk -F, 'NR>1 {print $1, $3}' istasyon.csv
awk -F, 'NR>1 {gun=substr($1,1,10); if ($3+0 > mak[gun]) mak[gun]=$3+0} END {for (g in mak) printf "%s %.1f\\n", g, mak[g]}' istasyon.csv | sort
awk -F, 'NR>1 && $3 != "" {t+=$3; n++} END {if (n>0) printf "ortalama = %.2f C (%d kayıt)\\n", t/n, n}' istasyon.csv
awk -F, 'NR>1 {print $1 "," $2 "," ($3*9/5+32)}' istasyon.csv > fahrenheit.csv
awk -F: '$4 ~ /^HGT$/ && $5 == "500 mb" {print $1}' envanter.txt
awk 'NR==FNR {ist[$1]; next} ($1 in ist)' istasyon_listesi.txt metar_gun.txt`,notes:[{line:1,text:"Varsayılan ayırıcı boşluktur; `$1` ilk alan, `$0` satırın tamamıdır."},{line:2,text:"Koşul süslü parantezin önüne yazılır: yalnız LTBA satırları. `{print}` = `{print $0}`."},{line:3,text:"`-F,` alan ayırıcısını virgül yapar; `NR>1` başlık satırını atlar (`NR` = okunan satır numarası)."},{line:4,text:"Günlük maksimum: tarihin ilk 10 karakteri anahtar, dizi (`mak`) o anahtarda en büyüğü tutar. `$3+0` metni sayıya zorlar. `END` bloğu dosya bitince bir kez çalışır."},{line:5,text:"Boş olmayan kayıtların ortalaması; `n>0` denetimi sıfıra bölmeyi engeller."},{line:6,text:"Birim çevirme: santigrattan fahrenhayta, yeni bir CSV üretir."},{line:7,text:"wgrib2 envanterinde iki nokta ayırıcıdır; 4. alan değişken, 5. alan seviyedir. `~` düzenli ifade eşleşmesidir. Çıktı: mesaj numaraları."},{line:8,text:"İki dosyayı birleştirme kalıbı: ilk dosyadaki istasyon kodları bir kümeye alınır, ikinci dosyadan yalnız o kodlar süzülür."}]},{k:"note",tone:"trap",text:'CSV’de `-F,` yalnız “virgül alan içinde geçmiyorsa” doğrudur. `"Ankara, Esenboğa",12.4` gibi tırnaklı bir alan varsa `awk` sütunları kaydırır ve yanlış sayı hesaplarsınız. Ayrıca eksik veri `-9999` ya da `M` olarak gelirse ortalamanız bozulur: hesaba katmadan önce **mutlaka süzün**.'},{k:"code",lang:"bash",title:"Küçük araçların zinciri",code:`cut -d, -f2 istasyon.csv | sort | uniq -c | sort -rn | head
sort -t, -k3 -g -r istasyon.csv | head -5
cut -d, -f1,3 istasyon.csv | tr ',' '\\t' > iki_sutun.tsv
paste tarih.txt sicaklik.txt > birlesik.tsv
head -3 istasyon.csv
tail -n +2 istasyon.csv | wc -l
wc -l *.csv
tr -d '\\r' < windows.csv | tr '[:upper:]' '[:lower:]' > temiz.csv`,notes:[{line:1,text:"Klasik “en sık geçen” kalıbı: 2. sütunu al, sırala, tekrarları say, sayıya göre tersten sırala. Hangi istasyon en çok kayıt üretmiş?"},{line:2,text:"`-t,` ayırıcı, `-k3` 3. alana göre, `-g` genel sayısal (bilimsel gösterimi de anlar), `-r` tersten: en yüksek beş sıcaklık."},{line:3,text:"`cut` sütun seçer, `tr` karakter çevirir; virgülü sekmeye dönüştürür."},{line:4,text:"`paste` iki dosyayı satır satır yan yana ekler; ayrı üretilmiş serileri birleştirmenin en ucuz yolu."},{line:6,text:"`tail -n +2` ikinci satırdan itibaren demektir; başlığı çıkarıp kaç kayıt olduğunu sayar."},{line:7,text:"Her dosyanın satır sayısı ve toplam; indirme eksik mi diye bakarken ilk komut."},{line:8,text:"`<` ile dosyayı girdi olarak veriyoruz. `tr`’nin dosya argümanı yoktur, yalnız akış okur."}]},{k:"p",text:"Modern veri kaynakları (Open-Meteo, ECMWF API, MGM servisleri) JSON döner. JSON satır temelli olmadığı için `grep` orada zayıf kalır; `jq` bu iş için yazılmış küçük bir sorgu dilidir ve boru hattına aynı doğallıkla girer."},{k:"code",lang:"bash",title:"jq ile JSON gezmek",code:`curl -s "https://api.open-meteo.com/v1/forecast?latitude=41.01&longitude=28.98&hourly=temperature_2m,wind_speed_10m" > tahmin.json
jq 'keys' tahmin.json
jq '.hourly | keys' tahmin.json
jq -r '.hourly.temperature_2m | max' tahmin.json
jq -r '[.hourly.time, .hourly.temperature_2m] | transpose[] | @tsv' tahmin.json | head
jq -r '[.hourly.time, .hourly.temperature_2m] | transpose[] | select(.[1] > 30) | @tsv' tahmin.json
jq -r '.hourly.time[0] + " ... " + .hourly.time[-1]' tahmin.json
jq -s 'map(.hourly.temperature_2m[0])' sehir_*.json`,notes:[{line:1,text:"`-s` curl’ün ilerleme çubuğunu susturur; ham JSON dosyaya yazılır."},{line:2,text:"İlk adım her zaman keşiftir: belgenin en üst anahtarları neler?"},{line:4,text:"`-r` tırnaksız ham çıktı verir; boru hattına sokacaksanız şarttır. Maksimum sıcaklık tek sayı olarak döner."},{line:5,text:"`transpose` iki paralel diziyi (zaman, sıcaklık) satır çiftlerine çevirir; `@tsv` sekmeyle ayırır. Artık `awk` ile işlenebilir."},{line:6,text:"30 derecenin üstündeki saatleri süzer: JSON içinde koşullu seçim."},{line:7,text:"`[-1]` dizinin son elemanı; tahmin penceresinin başı ve sonu."},{line:8,text:"`-s` (slurp) birden çok dosyayı tek diziye toplar; çok şehirli karşılaştırmanın kalıbı."}]},{k:"table",caption:"Hangi iş için hangi metin aracı",head:["İhtiyaç","Araç","Örnek çekirdek"],rows:[["Satır süzmek","`grep`",'`grep -E "^(LTBA|LTFM) "`'],["Satır içi değiştirmek","`sed`",'`sed "s/,/;/g"`'],["Sütunla hesap, koşullu birikim","`awk`",'`awk -F, "{t+=\\$3} END{print t/NR}"`'],["Sütun kesmek","`cut`","`cut -d, -f1,3`"],["Saymak, tekilleştirmek","`sort`+`uniq -c`","`sort | uniq -c | sort -rn`"],["JSON okumak","`jq`",'`jq -r ".hourly.time[]"`'],["İki dosyayı eşleştirmek","`awk` (NR==FNR) veya `join`","`join -t, -1 1 -2 1 a.csv b.csv`"]]}]},{id:"betik",title:"Bash betiği: işi bir kez yaz, bin kez koş",lead:"Kabukta yazdığınız her satır aslında bir betiğin taslağıdır. Bu bölüm o taslağı, yarın da güvenle koşacak bir programa çevirmeyi anlatır.",blocks:[{k:"p",text:"Bir betik ilk satırında hangi yorumlayıcıyla çalışacağını söyler; buna shebang denir. Hemen ardından gelen `set -euo pipefail` satırı betiği sessizce yanlış sonuç üretmekten korur. Meteoroloji betiklerinde bu isteğe bağlı değildir: hatalı bir indirme sessizce devam ederse, sonunda elinizde boş dosyalardan hesaplanmış bir “ortalama” kalır."},{k:"code",lang:"bash",title:"Her betiğin başlangıcı",code:`#!/usr/bin/env bash
set -euo pipefail

KOK="\${KOK:-/work/ali/gfs}"
TARIH="\${1:-$(date -u -d 'yesterday' +%Y%m%d)}"
KOSU="\${2:-00}"

mkdir -p "$KOK/$TARIH$KOSU"
cd "$KOK/$TARIH$KOSU"
echo "[$(date -u +%H:%M:%SZ)] hedef dizin: $PWD"`,notes:[{line:1,text:"`/usr/bin/env bash` bash’i `PATH` üzerinden bulur; farklı makinelerde farklı yere kurulmuş olabilir."},{line:2,text:"`-e` hata veren komutta betiği durdurur, `-u` tanımsız değişkende hata verir, `-o pipefail` boru hattındaki herhangi bir halka çökerse zinciri başarısız sayar."},{line:4,text:"Kalıp şudur: dışarıdan verilmemişse varsayılanı kullan. Betiği ayar dosyası olmadan esnek kılar."},{line:5,text:"`$1` ilk argüman; verilmemişse dünün tarihi. Koşu saatleri UTC olduğu için `-u` şarttır."},{line:8,text:"Değişkenler daima çift tırnak içinde kullanılır; yol içinde boşluk varsa betik yine de çalışır."}]},{k:"note",tone:"trap",text:'`set -e` her yerde kurtarmaz. `if komut; then` içinde, `&&`/`||` zincirinde ve bazı fonksiyon bağlamlarında hata betiği durdurmaz. Kritik adımlardan sonra çıktıyı elle denetleyin: `[[ -s dosya ]] || { echo "boş"; exit 1; }`.'},{k:"p",text:"Tırnak kuralları bash’te en çok hata üreten konudur. Çift tırnak değişkeni açar ama kelime bölünmesini engeller; tek tırnak hiçbir şeyi açmaz, içindekini harfi harfine verir. Yanlış tırnak yanlış dosya adı, yanlış dosya adı da yanlış grafik demektir."},{k:"code",lang:"bash",title:"Tırnakların farkı",code:`DEGISKEN="500 mb"
echo "$DEGISKEN"
echo '$DEGISKEN'
echo $DEGISKEN
wgrib2 in.grb2 -match ":HGT:$DEGISKEN:" -grib hgt.grb2
wgrib2 in.grb2 -match ':HGT:500 mb:' -grib hgt.grb2
DOSYA="Ankara veri.csv"
wc -l "$DOSYA"
wc -l $DOSYA`,notes:[{line:2,text:"Çıktı: 500 mb. Değişken açılır, boşluk korunur — istenen davranış."},{line:3,text:"Çıktı: $DEGISKEN. Tek tırnak içinde hiçbir şey yorumlanmaz."},{line:4,text:"Çıktı benzer görünür ama `echo` iki ayrı argüman almıştır; başka bir komutta bu bölünme felakete yol açar."},{line:5,text:"Değişken açılsın istiyorsak çift tırnak: desen wgrib2’ye tek argüman olarak gider."},{line:6,text:"Sabit desende tek tırnak tercih edilir; içindeki `$`, `*` ve boşluk kabuktan etkilenmez."},{line:8,text:"Doğru: dosya adı tek argüman, satır sayısı basılır."},{line:9,text:"Yanlış: kabuk iki dosya adı görür — Ankara ve veri.csv — ikisi için de “dosya yok” der."}]},{k:"note",tone:"trap",text:'Tırnaksız değişken yalnız boşlukta bölünmez, içindeki `*` **dosya adlarına da genişler**. `DESEN="*.nc"; echo $DESEN` size dizindeki dosyaları sayar. Kural: değişkeni kullandığınız her yerde çift tırnak; istisnayı bilerek yapıyorsanız yanına yorum satırı yazın.'},{k:"table",caption:"Tırnak ve açılım davranışı",head:["Yazım","Değişken açılır mı","Boşluk bölünür mü","Joker açılır mı","Ne zaman"],rows:[["`$VAR`","Evet","**Evet**","**Evet**","Neredeyse hiç"],['`"$VAR"`',"Evet","Hayır","Hayır","Varsayılan tercih"],["Tek tırnaklı metin","Hayır","Hayır","Hayır","Sabit desen, düzenli ifade"],['`"$(komut)"`',"Evet (komut çıktısı)","Hayır","Hayır","Tarih, sayım, yol üretimi"],['`"${DIZI[@]}"`',"Evet, eleman eleman","Hayır","Hayır","Dosya listesi gezmek"]]},{k:"p",text:"Döngü ve koşul, betiği komut listesinden programa çeviren şeydir. Koşulda iki yazım vardır: taşınabilir `[ ... ]` ve bash’e özgü `[[ ... ]]`. Bash betiği yazıyorsanız `[[ ]]` daha güvenlidir: içinde tırnaksız değişken bile kelimelere bölünmez."},{k:"code",lang:"bash",title:"Döngü, koşul, fonksiyon, argüman",code:`for SAAT in 000 006 012 018 024; do
  echo "işleniyor: f$SAAT"
done

for DOSYA in /work/ali/gfs/*.grb2; do
  [[ -e "$DOSYA" ]] || { echo "hiç dosya yok"; break; }
  wgrib2 "$DOSYA" -match ":HGT:500 mb:" -netcdf "\${DOSYA%.grb2}_hgt.nc"
done

DENEME=0
while [[ $DENEME -lt 3 ]]; do
  curl -sf -o veri.grb2 "$URL" && break
  DENEME=$((DENEME + 1))
  sleep 30
done

kontrol_et() {
  local yol="$1"
  local en_az="\${2:-1000}"
  [[ -s "$yol" ]] || { echo "HATA: $yol yok ya da boş" >&2; return 1; }
  local boyut
  boyut=$(stat -c %s "$yol")
  [[ "$boyut" -ge "$en_az" ]] || { echo "HATA: $yol çok küçük ($boyut bayt)" >&2; return 1; }
  return 0
}

kontrol_et veri.grb2 100000 || exit 1
echo "argüman sayısı: $#  hepsi: $@"`,notes:[{line:1,text:"Liste üzerinde gezinme. Tahmin saatleri üç basamaklıdır çünkü dosya adları öyledir."},{line:5,text:"Joker doğrudan `for` içinde kullanılabilir; kabuk listeyi döngüden önce üretir."},{line:6,text:"Hiç eşleşme yoksa kabuk deseni olduğu gibi bırakır ve döngü bir kez sahte adla çalışır; `-e` denetimi bu tuzağı kapatır."},{line:7,text:"Sondaki uzantıyı kırpma kalıbı: çıktı adını girdiden türetmenin standart yolu."},{line:11,text:"Yeniden deneme döngüsü: ağ hatası çoğu kez geçicidir, üç deneme kesintilerin çoğunu yutar."},{line:12,text:"`curl -f` HTTP 404’te hata döndürür; `-f` olmadan curl hata sayfasını dosyaya yazar ve başarılı olduğunu söyler."},{line:13,text:"Çift parantez aritmetik açılımdır; bash’te sayı işlemi böyle yapılır."},{line:17,text:"Fonksiyon tanımı. `local` değişkeni fonksiyona hapseder; yoksa betiğin geri kalanını kirletirsiniz."},{line:20,text:"Hata mesajları `>&2` ile standart hataya yazılır; böylece boru hattındaki veriye karışmaz."},{line:22,text:"`stat -c %s` dosya boyutunu bayt olarak verir (GNU). Yarım inmiş GRIB’i yakalamanın en ucuz yolu."},{line:28,text:"`$#` argüman sayısı, `$@` argümanların tamamı. Betik kullanımını denetlerken ilk bakılan yer."}]},{k:"note",tone:"trap",text:'Karşılaştırma işleçlerini karıştırmak sessiz hata üretir: `=` **metin**, `-eq` **sayı** eşitliğidir. `[[ "08" -eq 8 ]]` doğrudur ama `[[ "08" = 8 ]]` yanlıştır. Koşu saatlerini `06`, `12` gibi sıfır dolgulu yazdığınız için bu ikisi sürekli karşınıza çıkar. Ayrıca `[ ]` içinde `<` yönlendirme sanılır; sayı karşılaştırmasında `-lt` kullanın.'},{k:"code",lang:"bash",title:"Tarih aritmetiği (GNU date)",code:`date -u +%Y%m%d
date -u -d 'yesterday' +%Y%m%d
date -u -d '2026-09-16 00:00 UTC +6 hours' +%Y%m%d%H
BASLANGIC=$(date -u -d '2026-09-01' +%s)
BITIS=$(date -u -d '2026-09-05' +%s)
for (( T=BASLANGIC; T<=BITIS; T+=86400 )); do
  GUN=$(date -u -d "@$T" +%Y%m%d)
  echo "gün: $GUN"
done
for KOSU in 00 06 12 18; do
  GECERLI=$(date -u -d "2026-09-16 $KOSU:00 UTC +12 hours" +%Y-%m-%dT%H:%MZ)
  echo "koşu \${KOSU}Z -> +12 sa geçerlilik: $GECERLI"
done`,notes:[{line:1,text:"Bugünün UTC tarihi. Model dünyasında yerel saat yoktur; `-u` unutulmaz."},{line:2,text:"“Dünkü koşu” kalıbı; ay ve yıl geçişlerini kendisi halleder — elle çıkarma yapmayın."},{line:3,text:"Belirli bir ana saat eklemek: geçerlilik zamanı hesabının çekirdeği."},{line:4,text:"`%s` Unix zaman damgasıdır (1970’ten beri saniye); tarih aralığında dolaşmanın en güvenli yolu."},{line:6,text:"86400 saniye bir gündür. C tarzı `for` döngüsü bash’te vardır."},{line:7,text:"Baştaki `@` girdinin zaman damgası olduğunu söyler; sayıyı tarihe geri çevirir."},{line:10,text:"Koşu saatleri üzerinde gezinip her biri için geçerlilik zamanı üretir: arşiv adlandırmasının temeli."}]},{k:"note",tone:"trap",text:"Yukarıdaki tarih hesapları **GNU date** içindir. macOS ve BSD’de `date -d` yoktur, karşılığı `date -v-1d` biçimindedir. Betiğiniz dizüstünde çalışıp sunucuda ya da tersi yönde patlarsa ilk şüpheli budur; taşınabilirlik gerekiyorsa tarihi Python ile üretin."},{k:"code",lang:"bash",title:"indir_gfs.sh — uçtan uca indirme betiği",code:`#!/usr/bin/env bash
set -euo pipefail

TARIH="\${1:-$(date -u -d 'yesterday' +%Y%m%d)}"
KOSU="\${2:-00}"
SAATLER=(000 006 012 018 024)
KOK="/work/$USER/gfs/$TARIH$KOSU"
TABAN="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod"
LOG="$KOK/indirme.log"

mkdir -p "$KOK"
cd "$KOK"

kaydet() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"; }

indir() {
  local saat="$1"
  local ad="gfs.t\${KOSU}z.pgrb2.0p25.f$saat"
  local url="$TABAN/gfs.$TARIH/$KOSU/atmos/$ad"
  local deneme=1

  if [[ -s "$ad" ]] && (( $(stat -c %s "$ad") > 100000000 )); then
    kaydet "atlandı (zaten var): $ad"
    return 0
  fi

  while (( deneme <= 3 )); do
    kaydet "indiriliyor ($deneme/3): $ad"
    if curl -sfS --connect-timeout 20 --max-time 900 -o "$ad.parca" "$url"; then
      mv "$ad.parca" "$ad"
      kaydet "tamam: $ad ($(stat -c %s "$ad") bayt)"
      return 0
    fi
    rm -f "$ad.parca"
    deneme=$((deneme + 1))
    sleep 60
  done

  kaydet "BASARISIZ: $ad"
  return 1
}

HATA=0
for S in "\${SAATLER[@]}"; do
  indir "$S" || HATA=$((HATA + 1))
done

kaydet "bitti: $(( \${#SAATLER[@]} - HATA )) başarılı, $HATA başarısız"
[[ $HATA -eq 0 ]] || exit 1`,notes:[{line:6,text:"Bash dizisi: indirilecek tahmin saatleri tek yerde tanımlanır, değiştirmesi kolaydır."},{line:9,text:"Günlük dosyası veriyle aynı dizinde durur; “bu klasör nasıl oluştu” sorusunun cevabı hep yanındadır."},{line:14,text:"`tee -a` mesajı hem ekrana basar hem günlüğe ekler; cron altında yalnız günlük kalır."},{line:18,text:"Dosya adı NOMADS’ın gerçek şemasıdır: koşu saati adın içine gömülüdür."},{line:22,text:"Yeniden koşulabilirlik: dosya zaten tamsa yeniden indirilmez. Betik kesildiğinde kaldığı yerden devam eder."},{line:29,text:"`-f` HTTP hatasında başarısız olur, `-S` hatayı gösterir, `--max-time` sonsuza kadar asılı kalmayı engeller."},{line:29,text:"Önce geçici `.parca` adına inilir: yarım dosya asla gerçek adı almaz, böylece sonraki koşu onu tam sanmaz."},{line:36,text:"Denemeler arasında bekleme; sunucu geçici olarak yoğunsa ısrar etmek yerine nefes alır."},{line:44,text:"Dizi elemanlarını tırnak içinde açmak zorunludur; aksi hâlde boşluklu değerler bölünür."},{line:49,text:"Betik başarısızsa sıfır dışı kodla çıkar ki cron ya da SLURM bunu hata olarak görebilsin."}]},{k:"lab",exampleId:"bash-download-gfs",label:"Atölye: GFS indirme betiğini adım adım kur"}]},{id:"veri-araclari",title:"Izgara veri araçları: wgrib2, ecCodes, NCO, CDO, GDAL",lead:"Model çıktısı GRIB ya da NetCDF olarak gelir. Bu beş araç, o dosyalardan istediğiniz alanı çekmenin, kesmenin, ortalamasını almanın ve haritaya çevirmenin standart yoludur.",blocks:[{k:"p",text:"Yeni başlayanın en sık hatası, her işi Python’la yapmaya çalışmaktır. Oysa 400 dosyanın zaman ortalamasını almak `cdo` için tek satır, Python için yarım saatlik bir bellek savaşıdır. Kural: **ızgarayı ızgara araçlarıyla, grafiği grafik kütüphanesiyle** yapın. Python’u zincirin sonunda, veri zaten küçüldükten sonra devreye sokun."},{k:"table",caption:"Ne yapmak istiyorsan hangi araç",head:["İstek","Araç","Tipik komut çekirdeği"],rows:[["GRIB’in içinde ne var öğrenmek","`wgrib2` / `grib_ls`","`wgrib2 -s dosya`"],["GRIB’den tek değişkeni ayıklamak","`wgrib2 -match`",'`-match ":HGT:500 mb:"`'],["GRIB’i NetCDF’e çevirmek","`wgrib2 -netcdf` / `cdo -f nc copy`","`wgrib2 in -netcdf out.nc`"],["NetCDF başlığını okumak","`ncdump -h`","`ncdump -h dosya.nc`"],["Değişken/boyut seçmek, birleştirmek","`ncks`, `ncrcat`","`ncks -v t -d lat,35.,43.`"],["Kutu kesmek, ortalama, iklim","`cdo`","`cdo -timmean -sellonlatbox,...`"],["Izgarayı değiştirmek","`cdo remapbil`","`cdo remapbil,hedef.txt in out`"],["Raster’a / GeoTIFF’e çevirmek","`gdal_translate`","`gdal_translate -of GTiff`"]]},{k:"code",lang:"bash",title:"wgrib2: GRIB2 dosyasının İsviçre çakısı",code:`wgrib2 gfs.t00z.pgrb2.0p25.f006
wgrib2 -s gfs.t00z.pgrb2.0p25.f006 | head -5
wgrib2 -s gfs.t00z.pgrb2.0p25.f006 | grep ":HGT:500 mb:"
wgrib2 gfs.t00z.pgrb2.0p25.f006 -match ":HGT:500 mb:" -grib hgt500.grb2
wgrib2 gfs.t00z.pgrb2.0p25.f006 -match ":(TMP|UGRD|VGRD):850 mb:" -grib 850.grb2
wgrib2 hgt500.grb2 -netcdf hgt500.nc
wgrib2 hgt500.grb2 -small_grib 25:45 35:43 hgt500_tr.grb2
wgrib2 hgt500.grb2 -lon 28.98 41.01
wgrib2 hgt500.grb2 -csv hgt500.csv
wgrib2 -grid hgt500.grb2`,notes:[{line:1,text:"Argümansız çağrı envanteri basar: mesaj numarası, bayt konumu, tarih, değişken, seviye, tahmin saati."},{line:2,text:"`-s` kısa envanter: iki nokta ile ayrılmış, `grep`/`awk` ile işlenmeye uygun tek satırlık kayıtlar."},{line:3,text:"Aranan alanın dosyada olup olmadığını görmenin en hızlı yolu. Çıktı boşsa değişken adı ya da seviye yazımı yanlıştır."},{line:4,text:"`-match` düzenli ifadedir ve envanter satırına uygulanır; eşleşen mesajlar yeni bir GRIB dosyasına yazılır. Baştaki ve sondaki iki nokta, kısmi eşleşmeyi engeller."},{line:5,text:"Parantezli seçenek: 850 hPa sıcaklık ve rüzgâr bileşenleri tek geçişte ayıklanır."},{line:6,text:"NetCDF’e çevirir. Önce `-match` ile küçültmek, sonra çevirmek her zaman daha hızlıdır."},{line:7,text:"`-small_grib lon1:lon2 lat1:lat2` biçimindedir; Türkiye kutusunu GRIB olarak kesip saklar."},{line:8,text:"Tek noktanın değerini basar (burada İstanbul). Doğrulama ve hızlı bakış için birebir."},{line:9,text:"Tüm ızgarayı enlem, boylam, değer sütunlarıyla CSV’ye döker — küçük alanlarda kullanın, global ızgarada dosya devleşir."},{line:10,text:"Izgara tanımını basar: projeksiyon, boyutlar, adım. İki dosyanın aynı ızgarada olup olmadığını böyle denetlersiniz."}]},{k:"note",tone:"trap",text:'`-match ":HGT:500 mb:"` ile `-match "HGT"` arasında dağlar kadar fark vardır: ikincisi `HGT` geçen her seviyeyi, hatta `CIN`/`CAPE` yanında görünen başka alanları da alır ve dosyanız 60 kat büyür. Seviyeyi de yazın. Bir diğer tuzak: seviye yazımı **birebir** eşleşmelidir — `500 mb` çalışır, `500mb` ve `500 hPa` çalışmaz.'},{k:"code",lang:"bash",title:"ecCodes: ECMWF dünyasının GRIB araçları",code:`grib_ls model.grib2
grib_ls -p shortName,level,typeOfLevel,dataDate,dataTime,stepRange model.grib2
grib_count model.grib2
grib_copy -w shortName=gh,level=500 model.grib2 gh500.grib2
grib_copy -w shortName=2t model.grib2 t2m.grib2
grib_get_data gh500.grib2 | head
grib_dump -p shortName gh500.grib2 | head -40
grib_set -s shortName=gh bozuk.grib2 duzeltilmis.grib2`,notes:[{line:1,text:"ecCodes tarafının envanteri; ECMWF/IFS verisiyle çalışırken `wgrib2`’den daha doğru anahtar isimleri verir."},{line:2,text:"`-p` hangi anahtarların basılacağını seçer. `shortName` ECMWF kısaltmasıdır: `gh` jeopotansiyel yükseklik, `2t` 2 m sıcaklık, `msl` deniz seviyesi basıncı."},{line:3,text:"Dosyadaki mesaj sayısı; indirmenin eksiksiz olduğunu doğrulamanın en ucuz yolu."},{line:4,text:"`-w` (where) koşuluna uyan mesajları kopyalar; `wgrib2 -match`’in ecCodes karşılığıdır ama regex değil, anahtar-değer eşleşmesidir."},{line:6,text:"Her ızgara noktası için enlem, boylam ve değeri metin olarak döker; küçük kutularda hızlı denetim."},{line:7,text:"Bir mesajın tüm GRIB anahtarlarını gösterir; “bu alanın birimi ne” sorusunun kesin cevabı buradadır."},{line:8,text:"Anahtarı değiştirip yeni dosya yazar; yanlış kodlanmış üretim verisini onarmak için kullanılır."}]},{k:"p",text:"NetCDF tarafında iki aile vardır. NCO (netCDF Operators) dosyanın **yapısıyla** ilgilenir: değişken seç, boyut kes, dosyaları uç uca ekle, öznitelik düzelt. `ncdump` ise dosyanın kimlik kartını okur; herhangi bir NetCDF ile ilk karşılaşmanız daima `ncdump -h` olmalıdır."},{k:"code",lang:"nco",title:"ncdump ve NCO ile yapı işleri",code:`ncdump -h gfs_hgt.nc
ncdump -v time gfs_hgt.nc | tail -20
ncks -m gfs_hgt.nc
ncks -O -v HGT_500mb gfs_hgt.nc yalniz_hgt.nc
ncks -O -d latitude,35.0,43.0 -d longitude,25.0,45.0 gfs_hgt.nc turkiye.nc
ncks -O -d time,0,8 gfs_hgt.nc ilk_uc_gun.nc
ncrcat -O f006.nc f012.nc f018.nc seri.nc
ncra -O seri.nc zaman_ortalamasi.nc
ncdiff -O koşu_yeni.nc koşu_eski.nc fark.nc
ncatted -O -a units,HGT_500mb,o,c,"gpm" turkiye.nc`,notes:[{line:1,text:"`-h` yalnız başlığı basar: boyutlar, değişkenler, birimler, küresel öznitelikler. Veriyi okumadığı için anında döner."},{line:2,text:"Tek bir değişkenin değerlerini gösterir; zaman ekseninin birimi ve başlangıcı burada anlaşılır."},{line:3,text:"`-m` yalnız meta veriyi özetler; `ncdump -h`’a göre daha derli toplu bir liste verir."},{line:4,text:"`-O` var olan çıktının üzerine sormadan yazar, `-v` değişken seçer. Dosya boyutu bir anda onda birine iner."},{line:5,text:"`-d boyut,min,maks` koordinat aralığıyla keser. Nokta kullanmak önemlidir: 35.0 değer, 35 ise **indis** demektir."},{line:6,text:"Aynı seçenek indisle de kullanılır: zaman ekseninin ilk 9 adımı (0–8 dâhil)."},{line:7,text:"`ncrcat` dosyaları zaman ekseninde uç uca ekler; ayrı tahmin saatlerinden tek seri kurar."},{line:8,text:"`ncra` kayıt boyutu (genelde zaman) üzerinden ortalama alır. `ncrcat` birleştirir, `ncra` ortalar: ikisini karıştırmayın."},{line:9,text:"İki dosyanın farkını alır; iki koşuyu ya da iki modeli karşılaştırmanın en kısa yolu."},{line:10,text:"Öznitelik düzenler: `o` üzerine yaz, `c` karakter tipi. Yanlış birim etiketini böyle düzeltirsiniz."}]},{k:"lab",exampleId:"nco-subset",label:"Atölye: NCO ile alan ve zaman kesmek"},{k:"p",text:"CDO ise dosyanın **içeriğiyle** ilgilenir: ortalama al, kutu kes, ızgara değiştir, iklim hesapla. 700’den fazla işleci vardır ama günlük hayatta on tanesi işinizi görür. En güçlü yanı zincirlenebilmesidir: ara dosya yazmadan birden çok işlemi tek geçişte yapar."},{k:"code",lang:"cdo",title:"CDO: günlük hayatta kullanılan on işleç",code:`cdo sinfon gfs_hgt.nc
cdo showname gfs_hgt.nc
cdo griddes gfs_hgt.nc
cdo -f nc copy model.grib2 model.nc
cdo selname,HGT_500mb gfs_hgt.nc hgt.nc
cdo sellonlatbox,25,45,35,43 hgt.nc hgt_tr.nc
cdo timmean hgt_tr.nc hgt_tr_ortalama.nc
cdo -timmean -sellonlatbox,25,45,35,43 -selname,HGT_500mb gfs_hgt.nc sonuc.nc
cdo remapbil,r720x361 hgt_tr.nc hgt_tr_yuksek.nc
cdo ymonmean era5_2m_1991_2020.nc iklim_aylik.nc
cdo sub era5_2026.nc iklim_aylik.nc anomali.nc
cdo fldmean hgt_tr.nc alan_ortalamasi.nc
cdo -P 4 timmean buyuk_seri.nc ort.nc`,notes:[{line:1,text:"Dosyanın tam kimliği: değişkenler, seviyeler, ızgara, zaman adımları. CDO ile her işe buradan başlanır."},{line:2,text:"Yalnız değişken adlarını basar; `selname` için doğru adı öğrenmenin hızlı yolu."},{line:3,text:"Izgara tanımını metin olarak verir. Bu çıktıyı dosyaya kaydedip `remap` işlemlerinde hedef ızgara olarak kullanabilirsiniz."},{line:4,text:"Biçim dönüştürme: `-f nc` çıktı biçimini, `copy` ise işlemin kendisini belirtir. GRIB’den NetCDF’e geçişin CDO yolu."},{line:6,text:"`sellonlatbox,batı,doğu,güney,kuzey` sırasıyla yazılır. Türkiye kutusu yaklaşık 25–45 D, 35–43 K’dir."},{line:7,text:"Zaman ekseni boyunca ortalama: tek bir alan kalır."},{line:8,text:"Zincirleme. İşlemler **sağdan sola** uygulanır: önce değişken seçilir, sonra kutu kesilir, en son ortalama alınır. Ara dosya yazılmadığı için çok daha hızlıdır."},{line:9,text:"Çift doğrusal yeniden ızgaralama; `r720x361` düzenli enlem-boylam ızgarasının kısa yazımıdır (0.5 derece)."},{line:10,text:"Çok yıllı seriden aylık iklim ortalaması üretir: anomali hesabının ilk adımı."},{line:11,text:"Gözlem eksi iklim: anomali alanı. `sub` iki dosyayı eleman eleman çıkarır."},{line:12,text:"`fldmean` alan ortalaması alır (ağırlıklandırmayı enlem kosinüsüyle kendisi yapar); tek bir zaman serisi üretir."},{line:13,text:"`-P` iş parçacığı sayısını verir; büyük serilerde belirgin hızlanma sağlar (tüm işleçler desteklemez)."}]},{k:"note",tone:"trap",text:"`sellonlatbox` sınır sırası **batı, doğu, güney, kuzey**’dir. Yanlışlıkla enlemi öne yazarsanız CDO hata vermez; size boş ya da anlamsız bir kutu döndürür. İkinci tuzak: boylam ekseni 0–360 olan dosyalarda `-25` yerine `335` yazmanız gerekir — Avrupa’yı kesip boş dosya aldığınızda önce `cdo griddes` ile eksenin aralığına bakın."},{k:"lab",exampleId:"cdo-mean",label:"Atölye: CDO ile alan kesip ortalama almak"},{k:"code",lang:"bash",title:"GDAL: ızgaradan haritaya",code:`gdalinfo hgt500.grb2
gdalinfo -stats hgt500.tif
gdal_translate -of GTiff -b 1 hgt500.grb2 hgt500.tif
gdalwarp -t_srs EPSG:3857 hgt500.tif hgt500_web.tif
gdal_translate -of PNG -ot Byte -scale 5000 5900 0 255 hgt500.tif hgt500.png
gdaldem color-relief hgt500.tif renkler.txt hgt500_renkli.tif
gdal_translate -projwin 25 43 45 35 hgt500.tif hgt500_tr.tif`,notes:[{line:1,text:"GDAL GRIB2’yi de raster olarak okur: bant sayısı, boyutlar, projeksiyon ve her bandın açıklaması basılır."},{line:2,text:"`-stats` en küçük, en büyük, ortalama ve standart sapmayı hesaplar; renk ölçeğini seçerken gereken sayılar."},{line:3,text:"`-b 1` birinci bandı (ilk GRIB mesajını) alır. GeoTIFF çıktısı CBS yazılımlarıyla uyumludur."},{line:4,text:"Projeksiyon değiştirme: EPSG:3857 web haritalarının (Leaflet/MapLibre) kullandığı sistemdir."},{line:5,text:"`-scale girdi_min girdi_maks çıktı_min çıktı_maks` değerleri 0–255 aralığına sıkıştırır; PNG ancak böyle anlamlı görünür."},{line:6,text:"Metin dosyasındaki değer-renk eşleşmesine göre renklendirir; hızlı önizleme haritası üretmenin kestirme yolu."},{line:7,text:"`-projwin` kutusu **sol üst, sağ alt** sırasıyla verilir: batı, kuzey, doğu, güney."}]},{k:"table",caption:"Üç dosya biçimi, üç dünya",head:["Biçim","Nerede karşınıza çıkar","Güçlü yanı","Zayıf yanı"],rows:[["GRIB2","GFS, ECMWF, ICON, MGM ürünleri","Çok sıkı sıkıştırma, mesaj başına bağımsız erişim","Kendi başına okunaksız; araç şart"],["NetCDF4","Analiz, iklim verisi, model ara ürünü","Meta verisi zengin, kütüphane desteği geniş","Dosya boyutu büyük"],["GeoTIFF","Harita, CBS, web katmanı","Projeksiyon bilgisi gömülü, her CBS okur","Zaman boyutu doğal değil"]]}]},{id:"indirme",title:"Veri indirme: gereken kadarını, zamanında",lead:"Bir GFS koşusu yüzlerce gigabayttır; sizin ihtiyacınız çoğu zaman birkaç megabayttır. Bu bölüm, o birkaç megabaytı doğru biçimde çekmenin yollarını anlatır. İki temel araç vardır: `curl` tek dosya üzerinde ince denetim sunar ve boru hattına doğal olarak girer; `wget` ise özyinelemeli indirme ve yarıda kalanı sürdürme konusunda rahattır.",blocks:[{k:"code",lang:"bash",title:"curl ve wget temelleri",code:`curl -O https://nomads.ncep.noaa.gov/pub/data/.../gfs.t00z.pgrb2.0p25.f006
curl -o f006.grb2 "$URL"
curl -sfSL --retry 3 --retry-delay 20 --max-time 900 -o f006.grb2 "$URL"
curl -sI "$URL" | head -5
wget -c -O f006.grb2 "$URL"
wget -q --show-progress -P /work/ali/gfs "$URL"
curl -s "https://api.open-meteo.com/v1/forecast?latitude=41&longitude=29&hourly=temperature_2m" | jq '.hourly.time[0]'`,notes:[{line:1,text:"`-O` (büyük O) dosyayı URL’deki adıyla kaydeder."},{line:2,text:"`-o` (küçük o) adı siz belirlersiniz. İkisini karıştırmak yaygın bir hatadır."},{line:3,text:"Üretim ayarı: sessiz ama hatayı göster, HTTP hatasında başarısız ol, yönlendirmeyi izle, üç kez dene, süre sınırı koy."},{line:4,text:"`-I` yalnız başlıkları ister; dosya var mı ve kaç bayt, indirmeden önce böyle öğrenilir."},{line:5,text:"`-c` yarıda kalan indirmeyi kaldığı yerden sürdürür; büyük dosyalarda hayat kurtarır."},{line:6,text:"`-P` hedef dizini belirler; `--show-progress` sessiz kipte bile çubuk gösterir."},{line:7,text:"API ile boru hattının birleştiği yer: indir, çöz, tek satır bilgi al."}]},{k:"note",tone:"trap",text:"`-f` olmadan `curl`, sunucunun döndürdüğü 404 hata sayfasını dosyaya yazar ve çıkış kodu 0 verir. Sonuçta elinizde 1,2 kB’lık bir HTML dosyası “GRIB” adıyla durur ve `wgrib2` anlaşılmaz bir hata basar. İndirmeden sonra **daima boyut denetimi** yapın."},{k:"p",text:"Asıl verim, GRIB dosyasının tamamını indirmemekten gelir. Her GRIB dosyası art arda dizilmiş bağımsız mesajlardan oluşur ve NOMADS her dosyanın yanına bir `.idx` dizin dosyası koyar: hangi mesajın dosyanın kaçıncı baytında başladığını söyler. Bir mesajın başlangıç ve bitiş baytını bilirseniz, HTTP aralık isteğiyle yalnız o parçayı çekersiniz. 400 MB yerine 1,5 MB indirmek demektir bu."},{k:"code",lang:"bash",title:"Byte-range ile tek mesaj indirmek",code:`TABAN="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.20260916/00/atmos"
AD="gfs.t00z.pgrb2.0p25.f006"

curl -sf -o idx.txt "$TABAN/$AD.idx"
head -3 idx.txt
# 1:0:d=2026091600:PRMSL:mean sea level:6 hour fcst:
# 2:1035487:d=2026091600:CLWMR:1 hybrid level:6 hour fcst:

BAS=$(awk -F: '$4=="HGT" && $5=="500 mb" {print $2; exit}' idx.txt)
SATIR=$(awk -F: '$4=="HGT" && $5=="500 mb" {print $1; exit}' idx.txt)
SON=$(awk -F: -v n="$((SATIR + 1))" '$1==n {print $2-1; exit}' idx.txt)

echo "aralık: $BAS-$SON"
curl -sf -r "$BAS-\${SON:-}" -o hgt500.grb2 "$TABAN/$AD"
wgrib2 hgt500.grb2 -s
ls -lh hgt500.grb2`,notes:[{line:4,text:"Önce dizin dosyası inilir; birkaç yüz kilobayttır, asıl dosyanın binde biri bile değildir."},{line:5,text:"Biçim sabittir: mesaj no, başlangıç baytı, koşu tarihi, değişken, seviye, tahmin adımı."},{line:9,text:"Aranan alanın başlangıç baytı. `exit` ilk eşleşmeden sonra durur."},{line:10,text:"Aynı mesajın sıra numarası; bitiş baytını bulmak için bir sonraki satıra bakacağız."},{line:11,text:"Bitiş baytı = bir sonraki mesajın başlangıcı eksi 1. Mesaj dosyanın sonuncusuysa bu boş kalır."},{line:14,text:"`-r baslangic-bitis` HTTP aralık isteğidir; bitiş boşsa dosyanın sonuna kadar iner (son mesaj durumu)."},{line:15,text:"Doğrulama: indirilen parçanın gerçekten geçerli bir GRIB mesajı olduğunu gösterir."},{line:16,text:"Boyutu görün: 400 MB yerine birkaç megabayt. Bant genişliği ve süre farkı budur."}]},{k:"note",tone:"trap",text:"Aralık isteğinde iki klasik hata vardır. Birincisi bitiş baytını **bir eksiltmemek**: sonraki mesajın ilk baytını da çekersiniz ve `wgrib2` dosyayı bozuk sayar. İkincisi dosyanın son mesajını isterken bitişi boş bırakmamak; orada `-r BAS-` yazılır, açık uçlu aralık geçerlidir."},{k:"p",text:"İkinci yol sunucunun kendi süzgecini kullanmaktır. NOMADS, GFS için bir CGI arayüzü sunar: istediğiniz değişkeni, seviyeyi ve coğrafi kutuyu URL’ye yazarsınız, sunucu kesip gönderir. Byte-range’den farkı, coğrafi kesmeyi de sunucunun yapmasıdır."},{k:"code",lang:"bash",title:"NOMADS süzgeç URL’si",code:`TARIH=20260916
KOSU=00
SAAT=006
SUZ="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl"

curl -sf -o hgt500_tr.grb2 \\
  "$SUZ?file=gfs.t\${KOSU}z.pgrb2.0p25.f$SAAT&lev_500_mb=on&var_HGT=on&subregion=&leftlon=25&rightlon=45&toplat=43&bottomlat=35&dir=%2Fgfs.$TARIH%2F$KOSU%2Fatmos"

wgrib2 hgt500_tr.grb2 -s
wgrib2 -grid hgt500_tr.grb2`,notes:[{line:6,text:"Satır sonundaki ters eğik çizgi komutu bir alt satırda sürdürür; uzun URL’leri okunur kılar."},{line:7,text:"`lev_500_mb=on` ve `var_HGT=on` seçim kutularının URL karşılığıdır; birden çok değişken için satırı çoğaltırsınız."},{line:7,text:"`subregion=` boş bırakılır ama **yazılması gerekir**; alt kutu isteğini bu anahtar açar."},{line:7,text:"`dir` içindeki `%2F` karakteri eğik çizginin URL kodudur; doğrudan `/` yazarsanız istek reddedilir."},{line:10,text:"Izgara denetimi: gerçekten kutu kadar mı geldi, yoksa global mi? Kesme çalışmadıysa burada anlaşılır."}]},{k:"note",tone:"trap",text:"Süzgeç arayüzü paylaşımlı bir kaynaktır ve aynı anda çok sayıda istek gönderen adresleri geçici olarak engeller. Döngü içinde `sleep 2`–5 koymak, koşut indirmeyi ikiyle üçle sınırlamak gerekir. Engellendiğinizde istek yavaşlamaz, doğrudan hata döner ve betiğiniz boş dosyalarla “başarıyla” biter."},{k:"p",text:"Üçüncü yol OPeNDAP’tır: dosyayı hiç indirmeden, ağ üzerinden bir NetCDF gibi açıp istediğiniz dilimi okursunuz. Analiz için son derece pratiktir; karşılığında sunucunun anlık yüküne ve ağ gecikmesine bağımlı olursunuz."},{k:"code",lang:"bash",title:"OPeNDAP ile uzaktan dilimleme",code:`URL="https://nomads.ncep.noaa.gov/dods/gfs_0p25/gfs20260916/gfs_0p25_00z"
ncdump -h "$URL" | head -40
ncks -O -v hgtprs -d lev,500.0,500.0 -d lat,35.0,43.0 -d lon,25.0,45.0 -d time,0,8 "$URL" hgt_tr.nc
cdo -sinfon "$URL"
ls -lh hgt_tr.nc`,notes:[{line:2,text:"Uzaktaki veri kümesinin başlığını okur; hangi değişken hangi adla duruyor, tek istekte görünür."},{line:3,text:"Yalnız istenen dilim ağdan geçer: tek seviye, tek kutu, dokuz zaman adımı. Yüzlerce gigabayt yerine birkaç megabayt."},{line:3,text:"OPeNDAP’ta değişken adları GRIB adlarından farklıdır: `hgtprs` basınç seviyelerindeki jeopotansiyel yüksekliktir."},{line:4,text:"CDO da OPeNDAP adreslerini okur (NetCDF kütüphanesi DAP desteğiyle derlenmişse)."}]},{k:"code",lang:"bash",title:"API anahtarını doğru saklamak (Copernicus CDS, ECMWF, ticari servisler)",code:`echo 'export CDS_API_KEY="uuid:asilanahtar"' >> ~/.gizli_env
chmod 600 ~/.gizli_env
source ~/.gizli_env

: "\${CDS_API_KEY:?CDS_API_KEY tanımlı değil; ~/.gizli_env dosyasını yükleyin}"
curl -sf -H "Authorization: Bearer $CDS_API_KEY" -o veri.nc "$API_URL"

cat > ~/.netrc <<'SON'
machine api.ornekservis.org
login ali
password gizliparola
SON
chmod 600 ~/.netrc
curl -sf -n -o veri.nc "https://api.ornekservis.org/indir"

echo ".gizli_env" >> .gitignore
echo "*.netrc" >> .gitignore`,notes:[{line:1,text:"Anahtar bir paroladır: betiğe gömülmez, depoya yüklenmez, ekran görüntüsünde paylaşılmaz. Doğru yer, depoya hiç girmeyen ayrı bir dosya ya da ortam değişkenidir."},{line:2,text:"600 izni: yalnız siz okuyabilirsiniz. Paylaşımlı sunucuda bu satır isteğe bağlı değildir."},{line:3,text:"`source` dosyadaki değişkenleri o anki kabuğa yükler."},{line:5,text:"`:?` kalıbı: değişken tanımsızsa betik anlamlı bir mesajla durur. Anahtarsız koşup saatler sonra boş dosya bulmaktan iyidir."},{line:6,text:"Anahtar yalnız bellekte; komut satırı geçmişine ve dosyaya düşmez."},{line:8,text:"`.netrc` curl ve wget’in tanıdığı standart kimlik dosyasıdır; `-n` onu kullanmasını söyler."},{line:16,text:"Son savunma hattı: gizli dosyalar sürüm kontrolüne hiç girmesin."}]},{k:"note",tone:"trap",text:'Anahtarı komut satırına yazmayın: `curl -H "Authorization: Bearer 12345..."` biçimindeki bir çağrı hem `~/.bash_history` dosyasına hem de aynı makinedeki herkesin görebildiği `ps` çıktısına düşer. Bir kez depoya gönderilmiş anahtar ise silinse bile git geçmişinde kalır; tek doğru çözüm o anahtarı **iptal edip yenilemektir**.'},{k:"code",lang:"bash",title:"cron ile zamanlama, flock ile üst üste binmeyi önleme",code:`crontab -e
# dk sa gün ay haftanınGünü  komut
25 4 * * * /usr/bin/flock -n /tmp/gfs00.lock /home/ali/bin/indir_gfs.sh >> /home/ali/log/gfs00.log 2>&1
25 10 * * * /usr/bin/flock -n /tmp/gfs06.lock /home/ali/bin/indir_gfs.sh "$(date -u +\\%Y\\%m\\%d)" 06 >> /home/ali/log/gfs06.log 2>&1
0 3 * * 0 find /work/ali/gfs -type f -mtime +21 -delete

crontab -l
flock -n /tmp/gfs00.lock -c './indir_gfs.sh' || echo "önceki koşu hâlâ sürüyor, atlandı"`,notes:[{line:1,text:"Zamanlama tablosunu düzenler. Beş alan sırasıyla dakika, saat, ayın günü, ay, haftanın günüdür."},{line:3,text:"00Z koşusu genelde 03:30–04:20 UTC arasında yayımlanır; 04:25 makul bir başlangıçtır."},{line:3,text:"`flock -n` kilit alınamazsa **beklemeden çıkar**: önceki koşu sürüyorsa ikincisi başlamaz."},{line:3,text:"Çıktı ve hata günlüğe yönlendirilir; cron altında ekran yoktur, günlük tutmazsanız hata görünmez."},{line:4,text:"cron içinde yüzde işareti özel anlamlıdır ve satır sonu sayılır; ters eğik çizgiyle kaçırmak zorunludur."},{line:5,text:"Haftalık temizlik: 21 günden eski ham dosyaları siler. Disk kotası dolmadan önce yazılır."},{line:7,text:"Kilidi elle sınamak: iki kez çalıştırın, ikincisi mesajı basıp çıkmalı."}]},{k:"note",tone:"trap",text:"cron, sizin `PATH`’ınızla değil çok dar bir ortamla çalışır: elle koşarken bulunan `wgrib2`, `cdo` ya da `conda` cron altında “command not found” olur. Çözüm, betiğin başında `PATH`’i açıkça ayarlamak ve tüm araçları **tam yolla** çağırmaktır. Ayrıca cron saatleri makinenin yerel saatine göredir; UTC istiyorsanız `crontab` içinde `CRON_TZ=UTC` satırını ekleyin."}]},{id:"ortam",title:"Ortam ve yeniden üretilebilirlik",lead:"“Bende çalışıyordu” cümlesi bir teşhistir: ortam tarif edilmemiştir. Bu bölüm o tarifi dosyaya dökmenin yollarını anlatır.",blocks:[{k:"p",text:"Bir analiz üç şeye bağlıdır: veriye, koda ve ortama. İlk ikisini kolayca paylaşırsınız; üçüncüsü sessizce değişir. `numpy` sürümü değişir, `netcdf4` farklı bir HDF5’e bağlanır, `cdo` yeni sürümde bir işlecin varsayılanını değiştirir — ve altı ay sonra aynı betik farklı bir harita üretir. Çözüm ortamı da bir dosyaya yazmaktır."},{k:"code",lang:"bash",title:"conda/mamba ile yalıtılmış ortam",code:`mamba create -n meteo -c conda-forge python=3.11 xarray netcdf4 cfgrib eccodes cdo nco matplotlib cartopy
mamba activate meteo
python -c "import xarray; print(xarray.__version__)"
cdo -V
mamba env export --no-builds > environment.yml
mamba env create -f environment.yml -n meteo_kopya
mamba env list
mamba deactivate`,notes:[{line:1,text:"`-n` ortam adı, `-c conda-forge` paket kaynağı. Meteoroloji paketlerinin neredeyse tamamı conda-forge deposundadır."},{line:1,text:"`mamba`, `conda` ile aynı komutları alır ama bağımlılık çözümünü çok daha hızlı yapar; büyük ortamlarda fark dakikalarla ölçülür."},{line:2,text:"Ortamı etkinleştirir; bundan sonra `python` ve `cdo` bu ortamın sürümleridir."},{line:3,text:"Doğrulama alışkanlığı: kurulumun gerçekten çalıştığını sürüm basarak görün."},{line:5,text:"Ortamın tarifini dosyaya döker. `--no-builds` derleme etiketlerini atar; dosya başka işletim sistemlerinde de kurulabilir olur."},{line:6,text:"Tarif dosyasından ortamı yeniden kurar. Meslektaşınıza göndereceğiniz şey budur."},{line:7,text:"Makinedeki tüm ortamları ve yollarını listeler."}]},{k:"note",tone:"trap",text:'`conda activate` bir betiğin içinden doğrudan çalışmaz; “your shell has not been properly configured” hatasını verir, çünkü etkinleştirme bir kabuk fonksiyonudur. Betikte ya `source "$(conda info --base)/etc/profile.d/conda.sh"` satırını önce ekleyin, ya da `conda run -n meteo python betik.py` biçimini kullanın.'},{k:"p",text:"Sürüm sabitleme bir denge işidir. Hiç sabitlemezseniz ortam kendiliğinden kayar; her şeyi tam sürümle çakarsanız dosya başka bir makinede hiç kurulmaz. Pratik yol, üretim işlerinde sıkı, keşif işlerinde gevşek davranmaktır."},{k:"table",caption:"Sabitleme düzeyleri",head:["Yazım","Anlamı","Ne zaman","Risk"],rows:[["`xarray`","En yenisi","Hızlı deneme","Yarın farklı sonuç"],["`xarray>=2024.0`","En az bu sürüm","Kütüphane geliştirme","Orta"],["`xarray=2025.3.1`","Tam sürüm","Makale, üretim koşusu","Kurulum çakışabilir"],["`environment.yml` + kilit dosyası","Bağımlılıklar dâhil çözülmüş ağaç","Operasyonel sistem","Dosya büyük, elle okunmaz"],["Kap imgesi (Docker/Apptainer)","İşletim sistemi dâhil her şey","Uzun ömürlü tekrar","Depolama maliyeti"]]},{k:"p",text:"HPC kümelerinde conda her zaman uygun değildir; merkezî olarak derlenmiş, MPI ile doğru bağlanmış kütüphaneler gerekir. Bu makinelerde yazılım `module` sistemiyle açılıp kapanır. Bir model koşusunda derleme sırasında yüklediğiniz modüllerin **aynısını** koşu betiğinde de yüklemeniz gerekir."},{k:"code",lang:"bash",title:"module ile ortam seçmek",code:`module avail
module avail netcdf
module load intel/2023.2 openmpi/4.1.6 netcdf-fortran/4.6.1 hdf5/1.14.3
module list
module show netcdf-fortran/4.6.1
which mpif90
module purge
module save wrf_ortami
module restore wrf_ortami`,notes:[{line:1,text:"Kümede kurulu tüm yazılımları ve sürümlerini listeler; ilk gün yapılacak ilk iş."},{line:2,text:"Ada göre süzer; hangi NetCDF sürümleri var, hangi derleyiciye bağlı?"},{line:3,text:"Sıra önemlidir: önce derleyici, sonra MPI, sonra onlara bağlı kütüphaneler."},{line:4,text:"Yüklü modülleri gösterir. Bu çıktıyı koşu günlüğünüze kopyalayın; sorun çıkarsa ilk bakılacak yer burasıdır."},{line:5,text:"Modülün hangi ortam değişkenlerini ayarladığını açar: `LD_LIBRARY_PATH`, `NETCDF` gibi."},{line:6,text:"Doğrulama: derleyici sarmalayıcısı gerçekten yüklediğiniz MPI’den mi geliyor?"},{line:7,text:"Her şeyi kaldırır; temiz sayfadan başlamanın yolu."},{line:8,text:"Modül kümesini adlandırıp saklar; ertesi gün tek komutla geri yüklersiniz."}]},{k:"note",tone:"trap",text:"Modül yüklemelerini `~/.bashrc` dosyasına koymak cazip ama tehlikelidir: her işiniz o modül kümesiyle başlar ve farklı sürüm isteyen bir koşu sessizce yanlış kütüphaneye bağlanır. Modüller **iş betiğinin içinde**, `module purge` ile başlayan açık bir blokta yüklenmelidir. Ayrıca derlerken kullandığınız MPI ile koşarken yüklediğiniz MPI farklıysa model ya başlamaz ya da tek çekirdekte koşup sizi saatlerce oyalar."},{k:"p",text:"En güçlü yeniden üretilebilirlik aracı kaplardır (container). Docker masaüstünde yaygındır; HPC’de ise güvenlik nedeniyle genellikle Apptainer (eski adıyla Singularity) kullanılır, çünkü kapı yönetici hakkı olmadan çalıştırır. Bir kap imgesi işletim sistemi kütüphanelerini de içerdiği için beş yıl sonra bile aynı sonucu verir."},{k:"code",lang:"bash",title:"Apptainer ile taşınabilir araç zinciri",code:`apptainer pull meteo.sif docker://condaforge/mambaforge:latest
apptainer exec meteo.sif cdo -V
apptainer exec --bind /work:/work meteo.sif cdo timmean /work/ali/seri.nc /work/ali/ort.nc
apptainer shell --bind /scratch:/scratch meteo.sif
apptainer exec --bind "$PWD:/is" --pwd /is meteo.sif python analiz.py
docker run --rm -v "$PWD":/is -w /is condaforge/mambaforge cdo -V`,notes:[{line:1,text:"Docker imgesini indirip tek dosyalık `.sif` biçimine çevirir; o dosyayı kopyalamak ortamı kopyalamaktır."},{line:2,text:"Kabın içindeki aracı çalıştırır; ana makinede `cdo` kurulu olmasına gerek yoktur."},{line:3,text:"`--bind` ana makinedeki dizini kabın içine bağlar. Bağlamazsanız kap sizin verinizi **göremez**."},{line:4,text:"Kabın içinde etkileşimli kabuk açar; keşif ve hata ayıklama için."},{line:5,text:"Bulunduğunuz dizini `/is` olarak bağlar ve çalışma dizinini oraya kurar: taşınabilir çalıştırma kalıbı."},{line:6,text:"Aynı işin Docker karşılığı; `--rm` kap bitince kendini siler, `-v` bağlama, `-w` çalışma dizini."}]},{k:"note",tone:"trap",text:"`latest` etiketli bir imge yeniden üretilebilir **değildir**: altı ay sonra aynı ad altında bambaşka bir içerik durur. Makaleye ya da operasyonel sisteme bağlayacağınız imgeyi sürüm numarasıyla ya da içerik özetiyle (digest) sabitleyin ve `.sif` dosyasını arşivleyin."},{k:"list",ordered:!0,items:["Kod sürüm kontrolünde ve bir etiket (tag) ile işaretli.","Ortam tarifi (`environment.yml` ya da modül listesi) kodun yanında duruyor.","Girdi verisinin kaynağı, koşu tarihi ve indirme tarihi yazılı.","Rastgelelik varsa tohum (seed) sabitlenmiş.","Çıktı dosyalarının içine üretildiği komut ve sürüm bir öznitelik olarak yazılmış.","Her şeyi sıfırdan koşturan tek bir `calistir.sh` var ve gerçekten denenmiş."]}]},{id:"hpc",title:"Küme ve iş kuyruğu: SLURM",lead:"Model koşusu sizin oturumunuzda değil, paylaşımlı bir makine havuzunda çalışır. Kuyruğa doğru istekle girmek, işin ne zaman başlayacağını ve bitip bitmeyeceğini belirler.",blocks:[{k:"p",text:"Bir küme yüzlerce hesap düğümünden ve birkaç giriş düğümünden oluşur. Siz giriş düğümüne bağlanır, bir iş betiği yazar ve onu kuyruğa verirsiniz. Kuyruk yöneticisi (SLURM) istediğiniz kaynak boşalınca işinizi bir hesap düğümünde başlatır. Bu dolaylılık can sıkıcı görünür ama kaynağın adil paylaşılmasını sağlayan tek şeydir."},{k:"note",tone:"trap",text:"Giriş düğümünde ağır iş çalıştırmak kümedeki en sık görülen nezaketsizliktir. `./wrf.exe` ya da 200 dosyalık bir `cdo` döngüsünü orada başlatırsanız sistem yöneticisi işinizi öldürür ve hesabınıza uyarı düşer. Kısa bir deneme bile gerekiyorsa `srun --pty bash` ile etkileşimli bir hesap düğümü isteyin."},{k:"code",lang:"bash",title:"wrf_kos.sh — SLURM iş betiği",code:`#!/bin/bash
#SBATCH --job-name=wrf_d01
#SBATCH --account=meteoroloji
#SBATCH --partition=compute
#SBATCH --nodes=4
#SBATCH --ntasks-per-node=32
#SBATCH --cpus-per-task=1
#SBATCH --time=03:00:00
#SBATCH --mem=0
#SBATCH --output=logs/wrf_%j.out
#SBATCH --error=logs/wrf_%j.err
#SBATCH --mail-type=END,FAIL
#SBATCH --mail-user=ali@ornek.edu.tr

set -euo pipefail

module purge
module load intel/2023.2 openmpi/4.1.6 netcdf-fortran/4.6.1

cd "$SLURM_SUBMIT_DIR"
mkdir -p logs

echo "iş: $SLURM_JOB_ID  düğümler: $SLURM_JOB_NODELIST"
echo "toplam görev: $SLURM_NTASKS  başlangıç: $(date -u)"

srun --mpi=pmi2 ./wrf.exe

echo "bitiş: $(date -u)"
ls -lh wrfout_d01_*`,notes:[{line:2,text:"`#SBATCH` satırları yorum gibi görünür ama SLURM bunları okur; ilk çalıştırılabilir satırdan **önce** gelmelidirler."},{line:3,text:"Kullanım hangi projeye yazılacak? Çoğu merkezde bu alan zorunludur."},{line:4,text:"Bölüm (partition/queue) seçimi: kısa testler için `debug`, uzun koşular için `compute` gibi."},{line:5,text:"4 düğüm × düğüm başına 32 görev = 128 MPI süreci. Model alan bölümlemeniz bu sayıya uymalıdır."},{line:8,text:"Süre sınırı. İş bu sürede bitmezse **kesilir**; tahmininizin üstüne pay ekleyin ama abartmayın, uzun süre isteyen iş kuyrukta daha çok bekler."},{line:9,text:"`--mem=0` düğümün tüm belleğini ister; bellek sınırına takılıp ölmeyi önler."},{line:10,text:"`%j` iş numarasıyla değiştirilir; her koşunun günlüğü ayrı dosyaya düşer."},{line:20,text:"`SLURM_SUBMIT_DIR` işi gönderdiğiniz dizindir; iş betiği başka bir yerde başlayabileceği için bu satır önemlidir."},{line:23,text:"Hangi düğümlerde koştuğunu günlüğe yazmak, tek bir düğümün arızasını teşhis etmeyi kolaylaştırır."},{line:26,text:"`srun` MPI süreçlerini SLURM’ün ayırdığı kaynaklara dağıtır; `mpirun -np 128` yazmaya gerek yoktur, sayıyı SLURM’den alır."}]},{k:"table",caption:"Sık kullanılan SLURM direktifleri",head:["Direktif","Anlamı","Tipik değer"],rows:[["`--nodes`","Kaç düğüm","1–64"],["`--ntasks-per-node`","Düğüm başına MPI süreci","Düğümdeki çekirdek sayısı"],["`--cpus-per-task`","Süreç başına iş parçacığı (OpenMP)","1 (saf MPI) ya da 4–8 (hibrit)"],["`--time`","Üst süre sınırı","`03:00:00`"],["`--mem` / `--mem-per-cpu`","Bellek isteği","`0` (hepsi) ya da `4G`"],["`--array`","Dizi iş: aynı betiği çok girdiyle","`--array=0-23`"],["`--dependency`","Başka iş bitmeden başlama","`afterok:123456`"],["`--exclusive`","Düğümü tek başına kullan","Ölçekleme ölçerken"]]},{k:"code",lang:"bash",title:"İşi göndermek, izlemek, sonrasına bakmak",code:`sbatch wrf_kos.sh
squeue -u "$USER"
squeue -j 481203 -o "%.10i %.12j %.8T %.10M %.6D %R"
scontrol show job 481203
scancel 481203
scancel -u "$USER" --state=PENDING
sacct -j 481203 --format=JobID,JobName,Elapsed,MaxRSS,AllocCPUS,State,ExitCode
sinfo -s
srun --partition=debug --nodes=1 --ntasks=4 --time=00:20:00 --pty bash
sbatch --dependency=afterok:481203 son_islem.sh`,notes:[{line:1,text:"İşi kuyruğa verir ve iş numarasını basar. O numara bundan sonraki her komutun anahtarıdır."},{line:2,text:"Kendi işlerinizi listeler. `ST` sütunu durumdur: PD bekliyor, R koşuyor, CG bitiyor."},{line:3,text:"Çıktı biçimini siz belirlersiniz; sondaki `%R` beklemenin **sebebini** yazar (kaynak yok, öncelik, bağımlılık)."},{line:4,text:"İşin tüm ayrıntısı: istenen kaynaklar, tahmini başlangıç zamanı, çalışma dizini."},{line:6,text:"Yanlış ayarla gönderilmiş tüm bekleyen işleri toplu iptal eder; koşanlara dokunmaz."},{line:7,text:"İş bittikten sonraki muhasebe: ne kadar sürdü, en çok ne kadar bellek kullandı, hangi kodla çıktı. Bir sonraki isteğinizi buna göre ayarlarsınız."},{line:8,text:"Kümenin genel durumu: hangi bölümde kaç düğüm boş."},{line:9,text:"Etkileşimli oturum: derleme ve kısa denemeler için doğru yer."},{line:10,text:"Zincirleme: model koşusu başarıyla biterse son işlem otomatik başlar. Boru hattını SLURM içinde kurmanın yolu."}]},{k:"note",tone:"trap",text:"`--ntasks` ile `--cpus-per-task` karıştırılırsa küme size 128 çekirdek ayırır, model ise tek çekirdekte koşar; fatura tam kesilir, iş ise sekiz kat uzun sürer. Saf MPI modellerde `--cpus-per-task=1` olmalı ve MPI süreç sayısı model alan bölümlemesiyle (`nproc_x` × `nproc_y`) uyuşmalıdır."},{k:"p",text:"Çıktının nereye yazıldığı da bir tasarım kararıdır. Model yüzlerce megabaytlık dosyaları saniyeler içinde üretir; bunları ev dizinine yazarsanız kotayı doldurur ve işiniz yarıda ölür. Doğru yer paralel dosya sistemidir: `/scratch` ya da `/work`. Orası hızlıdır ama yedeklenmez."},{k:"note",tone:"trap",text:"`/scratch` çoğu merkezde 30 gün sonra **otomatik temizlenir** ve yedeği yoktur. Bir haftalık koşunun sonuçlarını orada unutursanız geri gelmez. Kural: koşu biter bitmez seçilmiş çıktıları (küçültülmüş, sıkıştırılmış) kalıcı depoya taşıyan bir son-işlem adımı, koşu betiğinin kendisine bağımlı iş olarak eklenir."},{k:"p",text:"Son olarak ölçekleme kavramı. Bir modeli daha çok çekirdekte koşturmak her zaman daha hızlı bitirmez: bir noktadan sonra süreçlerin birbiriyle konuşması (haberleşme) hesaptan uzun sürer. Bunu iki türlü ölçeriz."},{k:"table",caption:"Güçlü ve zayıf ölçekleme",head:["Tür","Sabit tutulan","Sorulan soru","İdeal sonuç","Meteorolojik karşılık"],rows:[["Güçlü (strong)","Toplam problem boyutu","Aynı işi 2 kat çekirdekle 2 kat hızlı bitirir miyim?","Süre yarıya iner","Aynı alanı daha erken teslim etmek"],["Zayıf (weak)","Çekirdek başına iş","2 kat büyük alanı 2 kat çekirdekle aynı sürede koşar mıyım?","Süre sabit kalır","Alanı büyütmek ya da çözünürlüğü artırmak"]]},{k:"note",tone:"trap",text:"Ölçekleme ölçümünü paylaşımlı düğümlerde yapmayın: yanınızdaki iş belleği ve ağı kullanırken aldığınız süreler gürültülüdür. `--exclusive` ile ölçün, her yapılandırmayı en az üç kez koşturun ve **en kısa** süreyi alın; ortalama, komşunun gürültüsünü de raporlar."}]},{id:"pratik",title:"Uçtan uca mini proje",lead:"Şimdiye kadarki her parçayı tek bir işte birleştiriyoruz: dünkü 00Z GFS koşusundan Türkiye kutusu için 500 hPa yüksekliğini indir, kes, günlük ortalamasını al, haritasını üret.",blocks:[{k:"p",text:"Hedef somut: bir klasörde, sonunda tek bir PNG dosyası ve onu üreten komutların günlüğü dursun. Her adım kendi başına doğrulanabilir olsun; bir yerde durursa nerede durduğu anlaşılsın. Toplam veri trafiği 20 MB’ı geçmesin — oysa aynı işi kaba kuvvetle yapan biri 3 GB indirirdi."},{k:"list",ordered:!0,items:["Tarih ve koşu belirlenir (dünkü 00Z), dizin açılır.","NOMADS süzgeç arayüzüyle yalnız `HGT` 500 mb ve yalnız Türkiye kutusu indirilir — sekiz tahmin saati.","İnen her dosya boyutça ve `wgrib2` ile içerikçe doğrulanır.","GRIB dosyaları tek bir NetCDF serisine çevrilir.","CDO ile zaman ortalaması alınır.","GDAL ile GeoTIFF ve PNG üretilir; sayısal denetim için tek nokta değeri basılır."]},{k:"note",tone:"info",text:"Gereken araçlar: `curl`, `wgrib2`, `cdo`, `gdal_translate`, `awk`. Hepsi `mamba create -n meteo -c conda-forge cdo nco eccodes wgrib2 gdal` ile tek seferde kurulur. WSL kullanıyorsanız çalışma dizinini `/mnt/c` altında **değil**, Linux ev dizininde açın."},{k:"code",lang:"bash",title:"gfs_500hpa_turkiye.sh — tam zincir",code:`#!/usr/bin/env bash
set -euo pipefail

TARIH="\${1:-$(date -u -d 'yesterday' +%Y%m%d)}"
KOSU=00
SAATLER=(000 003 006 009 012 015 018 021)
IS="$HOME/is/hgt500_$TARIH$KOSU"
SUZ="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl"
LOG="$IS/calisma.log"

mkdir -p "$IS/ham" "$IS/nc"
cd "$IS"
exec > >(tee -a "$LOG") 2>&1
echo "=== başlangıç $(date -u +%Y-%m-%dT%H:%M:%SZ) — koşu \${TARIH}\${KOSU}Z ==="

# 1) İNDİR — yalnız tek değişken, tek seviye, tek kutu
for S in "\${SAATLER[@]}"; do
  HEDEF="ham/hgt500_f$S.grb2"
  [[ -s "$HEDEF" ]] && { echo "atlandı: $HEDEF"; continue; }
  curl -sfS --retry 3 --retry-delay 15 --max-time 300 -o "$HEDEF.parca" \\
    "$SUZ?file=gfs.t\${KOSU}z.pgrb2.0p25.f$S&lev_500_mb=on&var_HGT=on&subregion=&leftlon=25&rightlon=45&toplat=43&bottomlat=35&dir=%2Fgfs.$TARIH%2F$KOSU%2Fatmos"
  mv "$HEDEF.parca" "$HEDEF"
  echo "indi: $HEDEF ($(stat -c %s "$HEDEF") bayt)"
  sleep 2
done

# 2) DOĞRULA — boyut ve gerçek GRIB içeriği
for G in ham/*.grb2; do
  (( $(stat -c %s "$G") > 20000 )) || { echo "HATA: $G çok küçük"; exit 1; }
  wgrib2 -s "$G" | grep -q ":HGT:500 mb:" || { echo "HATA: $G içinde HGT 500 mb yok"; exit 1; }
done
echo "doğrulama tamam: $(ls ham/*.grb2 | wc -l) dosya"

# 3) NETCDF'E ÇEVİR ve TEK SERİ YAP
for G in ham/*.grb2; do
  wgrib2 "$G" -netcdf "nc/$(basename "$G" .grb2).nc" > /dev/null
done
cdo -O mergetime nc/hgt500_f*.nc seri.nc
cdo sinfon seri.nc | head -20

# 4) ZAMAN ORTALAMASI
cdo -O timmean seri.nc ortalama.nc
cdo -O fldmean ortalama.nc alan_ortalamasi.nc
cdo output alan_ortalamasi.nc

# 5) HARİTA
gdal_translate -of GTiff -b 1 ortalama.nc ortalama.tif
gdalinfo -stats ortalama.tif | grep -E "Minimum|Maximum|Mean"
gdal_translate -of PNG -ot Byte -scale 5500 5900 0 255 ortalama.tif ortalama.png

echo "=== bitti: $IS/ortalama.png ==="
ls -lh ortalama.nc ortalama.tif ortalama.png`,notes:[{line:6,text:"Üç saatlik adımlarla bir günlük pencere: 00Z’den 21Z’ye sekiz alan. Ortalaması “günlük ortalama 500 hPa yüksekliği” olur."},{line:13,text:"`exec > >(tee -a ...)` betiğin **tüm** çıktısını hem ekrana hem günlüğe yönlendirir; her komuta ayrı ayrı yönlendirme yazmaktan kurtarır."},{line:18,text:"Yeniden koşulabilirlik: dosya varsa atlanır. Ağ koparsa betiği tekrar çalıştırmak yeterlidir."},{line:19,text:"Süzgeç URL’si hem değişkeni hem kutuyu sunucuda keser; dosya başına birkaç on kilobayt iner."},{line:22,text:"İki saniyelik bekleme, paylaşımlı sunucuya karşı nezakettir ve engellenmeyi önler."},{line:27,text:"Boyut denetimi kaba ama etkilidir: hata sayfası birkaç kilobayttır, gerçek veri değildir."},{line:28,text:"İçerik denetimi: dosyanın gerçekten aradığımız alanı taşıdığını `wgrib2` ile kanıtlıyoruz. Boyut doğru olup içerik yanlış olabilir."},{line:34,text:"`-netcdf` her GRIB’i ayrı NetCDF’e çevirir; `> /dev/null` wgrib2’nin envanter gürültüsünü susturur."},{line:36,text:"`mergetime` dosyaları zaman ekseninde birleştirir; `-O` var olan çıktının üzerine yazar."},{line:37,text:"Ara denetim: seri gerçekten sekiz zaman adımı içeriyor mu, ızgara beklediğiniz kutu mu?"},{line:40,text:"Zaman ortalaması: sekiz alandan tek alan kalır."},{line:41,text:"`fldmean` alanı tek sayıya indirger; enlem ağırlığını kendisi uygular."},{line:42,text:"`cdo output` o tek sayıyı ekrana basar. Türkiye üzerinde eylül ayında 5700–5850 gpm aralığı beklenir; sayı bunun dışındaysa bir adım yanlış gitmiştir."},{line:45,text:"GeoTIFF’e çevirme; `-b 1` tek bandı alır."},{line:46,text:"İstatistikler renk ölçeğini seçmek için: gerçek en küçük ve en büyük değerleri görün."},{line:47,text:"`-scale` sınırlarını bir önceki satırdaki gerçek değerlere göre ayarlayın; sabit yazarsanız harita ya bembeyaz ya simsiyah çıkar."}]},{k:"table",caption:"Adım adım: ne oldu, neyle, ne çıktı",head:["Adım","Araç","Girdi","Çıktı","Denetim"],rows:[["İndirme","`curl` + NOMADS süzgeci","URL","8 × `.grb2`","Boyut > 20 kB"],["İçerik doğrulama","`wgrib2 -s` + `grep`","`.grb2`","Onay","HGT 500 mb satırı var"],["Biçim dönüşümü","`wgrib2 -netcdf`","`.grb2`","8 × `.nc`","`ncdump -h` başlığı"],["Birleştirme","`cdo mergetime`","8 × `.nc`","`seri.nc`","`sinfon` 8 zaman adımı"],["Ortalama","`cdo timmean`","`seri.nc`","`ortalama.nc`","`fldmean` sayısı makul"],["Harita","`gdal_translate`","`ortalama.nc`","`.tif`, `.png`","`gdalinfo -stats`"]]},{k:"note",tone:"trap",text:"00Z koşusu 00:00 UTC’de hazır olmaz. Gözlemlerin toplanması, veri özümsemesi ve modelin koşması zaman alır; GFS 00Z ürünleri yaklaşık 03:30 UTC’den itibaren düşmeye başlar ve uzun tahmin saatleri 05:00 UTC’yi bulur. Betiği 00:30’da koşturursanız 404 alırsınız ve hata modelde değil, beklentinizdedir."},{k:"note",tone:"trap",text:"Tek bir alan indirdiğiniz için `wgrib2 -netcdf` çıktısındaki değişken adı beklediğiniz gibi olmayabilir: `HGT_500mb` yerine yalnız `HGT` görebilirsiniz. `cdo showname seri.nc` ile **gerçek adı görmeden** `selname` yazmayın; CDO olmayan bir değişken istendiğinde hata verir ve zincir orada kopar."},{k:"p",text:"Bu betiğin öğrettiği şey 500 hPa haritası değildir; **kalıptır**. İndir, doğrula, dönüştür, birleştir, indirge, göster. Yarın sıcaklık anomalisi ya da yağış toplamı istendiğinde değişen yalnız üç satırdır: süzgeç URL’sindeki değişken adı, CDO işleci ve renk ölçeği. İyi yazılmış bir zincirin değeri buradadır."}]},{id:"guvenlik-alışkanlık",title:"Güvenli alışkanlıklar",lead:"Komut satırında geri alma yoktur. Bu bölümdeki alışkanlıklar, bir günlük işi bir anda kaybetmenizi önleyen küçük ve ucuz önlemlerdir.",blocks:[{k:"p",text:"Deneyimli bir kullanıcıyı acemiden ayıran şey daha çok komut bilmesi değil, **yıkıcı komutları yavaş çalıştırmasıdır**. Silme, taşıma ve üzerine yazma işlemlerinde önce listeyi görür, sonra uygular. Aşağıdaki alışkanlıklar bu yavaşlığı kurala dönüştürür."},{k:"note",tone:"trap",text:'En pahalı tek satır şudur: `rm -rf "$KOK/$ALTDIZIN"`. Eğer `ALTDIZIN` tanımsızsa ya da boşsa komut `rm -rf "$KOK/"` hâline gelir ve tüm çalışma kökünüzü siler. Korunma: betiğin başında `set -u`, silmeden önce `[[ -n "${ALTDIZIN:-}" ]] || exit 1` denetimi ve yolun beklenen kökle başladığını doğrulamak.'},{k:"code",lang:"bash",title:"Silmeden önce görmek",code:`KOK="/work/ali/gfs"
ALT="20260916"

[[ -n "\${ALT:-}" ]] || { echo "ALT boş, iptal"; exit 1; }
[[ "$KOK/$ALT" == /work/ali/gfs/* ]] || { echo "yol beklenen kökte değil, iptal"; exit 1; }

find "$KOK/$ALT" -type f -name "*.parca" | head -20
find "$KOK/$ALT" -type f -name "*.parca" | wc -l
find "$KOK/$ALT" -type f -name "*.parca" -delete

rsync -avn --delete kaynak/ hedef/
rsync -av --delete kaynak/ hedef/

rm -I ham/*.grb2
trash-put eski_klasor 2>/dev/null || mv eski_klasor "$HOME/.cop/"`,notes:[{line:4,text:"Boş değişken denetimi: `rm` komutunun beklenmedik bir yola genişlemesini engeller."},{line:5,text:"Yol denetimi: silinecek şeyin gerçekten çalışma kökünün içinde olduğunu doğrular."},{line:7,text:"Önce göz: hangi dosyalar gidecek? İlk yirmisine bakmak çoğu hatayı burada yakalar."},{line:8,text:"Sonra sayı: 12 bekliyorken 4300 çıkarsa desen yanlıştır."},{line:9,text:"En son silme. Aynı `find` ifadesine yalnızca `-delete` eklendi; desen değişmedi."},{line:11,text:"`-n` kuru koşudur (dry run): rsync ne yapacağını söyler, hiçbir şeye dokunmaz. `--delete` ile **daima** önce bu satır çalıştırılır."},{line:12,text:"Kuru koşu listesi beklendiği gibiyse `-n` kaldırılıp gerçek çalıştırılır."},{line:14,text:"`rm -I` üçten çok dosyada tek seferlik onay ister; `-i` kadar yorucu değil ama toplu kazayı önler."},{line:15,text:"Silmek yerine taşımak: kendi çöp klasörünüz, haftalık `cron` ile boşaltılabilir."}]},{k:"note",tone:"trap",text:"`rsync --delete` hedefteki fazlalıkları siler. Kaynak yolunun sonundaki eğik çizgiyi unutursanız (`kaynak` yerine `kaynak/`) rsync dizinin **kendisini** hedefin içine kopyalar ve `--delete` ile hedefteki her şeyi temizler. Bu tek karakterlik fark yedeklerinizi siler; kuru koşu bunu bir saniyede gösterir."},{k:"p",text:"Dosya adları belge değil, veri yapısıdır. İyi bir ad hem sıralandığında doğru sırayı verir hem de betikle ayrıştırılabilir. Bunun tek makul yolu ISO 8601 tarih biçimi ve sıfır dolgulu sayılardır."},{k:"table",caption:"Dosya adlandırma",head:["Kötü","İyi","Neden"],rows:[["`son_veri.nc`","`hgt500_20260916T00Z_tr.nc`","“Son” yarın yanlış olur"],["`16-09-2026`","`20260916`","Alfabetik sıra = kronolojik sıra"],["`f6.grb2`","`f006.grb2`","Sıfır dolgu olmadan f10, f6’dan önce sıralanır"],["`Ankara Verisi.csv`","`ankara_verisi.csv`","Boşluk her betikte tırnak sorunu çıkarır"],["`sıcaklık_ölçüm.nc`","`sicaklik_olcum.nc`","Türkçe karakter bazı araçlarda bozulur"],["`deneme2_yeni_SON.nc`","`deneme_v03.nc`","Sürüm numarası sıralanabilir"]]},{k:"note",tone:"trap",text:"Dosya adındaki boşluk, tırnaksız her betikte hata üretir; Türkçe karakterler ise farklı dil ayarlarına sahip makineler arasında bozulabilir ve `sort` çıktısının sırası ortam değişkenine (`LC_ALL`) göre değişir. Betiklerin başında `export LC_ALL=C` yazmak, sıralamayı her makinede aynı yapar."},{k:"p",text:"Günlük tutmak fazladan iş gibi görünür; oysa bir hafta sonra “bu dosyayı hangi koşudan, hangi komutla üretmiştim” sorusunun tek cevabıdır. Ucuz kural: her betik ne yaptığını zaman damgasıyla bir dosyaya yazsın ve önemli çıktının içine üretim bilgisini gömsün."},{k:"code",lang:"bash",title:"Günlük, iz ve disk denetimi",code:`./islem.sh 2>&1 | tee -a "gunluk_$(date -u +%Y%m%d).log"
echo "$(date -u +%FT%TZ) | $USER | $(hostname) | $0 $*" >> ~/is_izi.log
ncatted -O -a uretim_komutu,global,o,c,"cdo timmean seri.nc ortalama.nc" ortalama.nc
ncatted -O -a uretim_tarihi,global,o,c,"$(date -u +%FT%TZ)" ortalama.nc

du -sh /work/ali/*
du -h --max-depth=1 /work/ali | sort -h | tail
df -h /work
quota -s 2>/dev/null || lfs quota -h -u "$USER" /work
find /work/ali -type f -size +2G -printf "%s\\t%p\\n" | sort -rn | head`,notes:[{line:1,text:"`2>&1 | tee -a` hem çıktıyı hem hatayı ekranda tutar ve günlüğe ekler; günlük adı tarihli olduğu için kendiliğinden döner."},{line:2,text:"Tek satırlık iz kaydı: ne zaman, kim, hangi makinede, hangi betiği hangi argümanla çalıştırdı."},{line:3,text:"Üretim komutunu NetCDF dosyasının içine küresel öznitelik olarak yazar; dosya taşınsa bile bilgi yanında gider."},{line:6,text:"Hangi alt klasör ne kadar yer kaplıyor? Kota dolduğunda ilk komut."},{line:7,text:"`sort -h` insan okur boyutları (K, M, G) doğru sıralar; en şişkin klasörler sona gelir."},{line:8,text:"Dosya sisteminin genel doluluk oranı."},{line:9,text:"Kullanıcı kotası. Lustre dosya sistemlerinde `lfs quota` ayrı bir komuttur."},{line:10,text:"En büyük dosyaları bulur; temizliğe buradan başlanır."}]},{k:"note",tone:"trap",text:"Günlük dosyası sessizce büyür. `cron` ile saat başı koşan bir betiğin `>>` ile büyüttüğü günlük, altı ayda kotanızı doldurup **başka işlerinizi** öldürebilir. Günlükleri tarihe göre ayrı dosyalara yazın ve eskileri temizleyen bir `find ... -mtime +30 -delete` girdisi ekleyin."},{k:"note",tone:"trap",text:"Büyük dosyayla çalışırken belleği unutmayın. `sort buyuk.csv` dosyayı belleğe almaya çalışır; 40 GB’lık bir dosyada makineyi ya kilitler ya da takas alanına düşürür. Akış araçlarını tercih edin (`awk`, `grep` satır satır okur), `sort` için `-S 2G -T /work/ali/tmp` ile bellek ve geçici dizin sınırı verin. Aynı şey Python için de geçerlidir: `xarray.open_dataset` yerine `open_mfdataset(..., chunks=...)` kullanın."},{k:"list",items:["Her yıkıcı komuttan önce aynı deseni `ls` ya da `find` ile çalıştır; listeyi gözünle gör.","`--dry-run` / `-n` destekleyen her araçta önce kuru koşu yap.","İndirmeyi geçici ada yap, ancak tamamlanınca gerçek adına taşı.","Ham veriyi asla üzerine yazma; ara ürünleri ayrı klasörde tut.","Betiği iki kez koşturabildiğinden emin ol: ikinci koşu ilkini bozmamalı.","Kritik çıktının bir kopyasını yedeklenen bir dosya sisteminde tut; `/scratch` yedek değildir.","Bir komutu anlamadan kopyalayıp yapıştırma; `man` sayfasına bakmak otuz saniye sürer."]}]}]};export{a as LINUX_TOOLS};
