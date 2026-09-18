const a=[{id:"fortran",title:"Fortran — modelin kendi dili",emoji:"🧮",intro:"Sayısal hava tahmini modellerinin çekirdeği (ECMWF IFS, WRF, ICON, GFS) Fortran ile yazılır. Nedeni duygusal değil pratiktir: çok boyutlu dizi doğal bir tiptir, derleyici döngüleri vektörleştirir, OpenMP/MPI ile aynı kaynak binlerce çekirdeğe dağıtılır. Bu grupta bir adveksiyon çözücüsünden başlayıp difüzyon, NetCDF okuma, modül tasarımı, dizi sözdizimi ve paralel döngüye kadar modelin iskeletini oluşturan parçaları tek tek yazıyoruz.",examples:[{id:"fortran-advection",title:"1B doğrusal adveksiyon — upwind şeması ve CFL denetimi",lang:"fortran",goal:'Sabit hızla taşınan bir sıcaklık tepesinin zamanla nereye gittiğini sonlu farkla hesaplamak; aynı zamanda "zaman adımı ne kadar büyük olabilir" sorusunun (CFL) kodda nasıl göründüğünü görmek.',data:"Veri dosyası yok: başlangıç alanı kod içinde Gauss tepesi olarak üretiliyor (dx = 5 km, 201 nokta, u = 10 m/s).",code:`program advect1d
  implicit none
  integer, parameter :: nx = 201, nt = 400
  real,    parameter :: dx = 5.0e3, uadv = 10.0, dt = 200.0
  real    :: q(nx), qn(nx), x, cfl
  integer :: i, n

  cfl = uadv * dt / dx
  if (cfl > 1.0) then
     print *, 'CFL =', cfl, ' > 1  -> kararsiz; dt kucult'
     stop 1
  end if

  do i = 1, nx                       ! baslangic: Gauss tepesi
     x = real(i - 1) * dx
     q(i) = exp(-((x - 200.0e3)**2) / (2.0 * (50.0e3)**2))
  end do

  do n = 1, nt                       ! zaman dongusu
     qn(1) = q(1) - cfl * (q(1) - q(nx))      ! dongusel sinir
     do i = 2, nx
        qn(i) = q(i) - cfl * (q(i) - q(i-1))  ! upwind (uadv > 0)
     end do
     q = qn
  end do

  open(unit=10, file='advect_out.txt', status='replace')
  do i = 1, nx
     write(10,'(F12.1,1X,F10.6)') real(i-1)*dx, q(i)
  end do
  close(10)

  print '(A,F6.3,A,F8.5,A,ES12.4)', 'CFL=', cfl, '  maks=', maxval(q), &
                                    '  integral=', sum(q)*dx
end program advect1d`,lineNotes:[{line:2,text:"`implicit none`: değişkeni bildirmeden kullanmayı yasaklar. Fortran'da ilk yazılacak satırdır; yoksa yazım hatası sessizce yeni bir değişken doğurur."},{line:3,text:"Izgara boyutu ve adım sayısı derleme zamanı sabiti. `parameter` olduğu için dizi boyutu statik ayrılır, hız kazanılır."},{line:4,text:"dx = 5 km, taşıyıcı hız 10 m/s, zaman adımı 200 s. Bu üçlü birlikte CFL sayısını belirler."},{line:5,text:"q şimdiki alan, qn bir sonraki adımın alanı. İki ayrı dizi şart: yerinde güncelleme şemayı bozar."},{line:8,text:"CFL = u·dt/dx. Bir zaman adımında dalganın kaç hücre ilerlediği demektir."},{line:9,text:"CFL > 1 ise upwind şeması patlıyor. Modelde bu kontrol yoksa çözüm saatler sonra NaN'a döner."},{line:14,text:"Başlangıç koşulu döngüsü: her ızgara noktası için fiziksel x koordinatı üretiliyor."},{line:16,text:"200 km merkezli, 50 km genişliğinde Gauss tepesi. Analitik çözümü bilinir: aynı şekil, kaymış olarak."},{line:19,text:"Dış döngü zaman, iç döngü uzay. Model entegrasyonunun tam iskeleti budur."},{line:20,text:"İlk nokta için yukarı-akış komşusu son noktadır: döngüsel (periyodik) sınır koşulu."},{line:22,text:"Upwind: türev, akışın GELDİĞİ yönden alınır. u > 0 için q(i) − q(i−1); u < 0 olsaydı q(i+1) − q(i) olurdu."},{line:24,text:"Dizi ataması: döngü yazmadan tüm alan kopyalanır. Fortran dizi sözdizimi burada devreye girer."},{line:27,text:"Sonucu düz metne yazıyoruz; GrADS/Python ile çizmek için yeterli."},{line:33,text:"Tepe yüksekliği ve integral birlikte basılır: upwind şeması tepeyi yayar ama integrali (kütleyi) yaklaşık korur."}],explain:["Adveksiyon denklemi ∂q/∂t + u·∂q/∂x = 0 bir modelin en basit taşıma parçasıdır; sıcaklık, nem, kirletici hep bu mantıkla taşınır.","Upwind şeması türevi akışın geldiği yönden alır. Bu seçim şemayı kararlı yapar ama karşılığında sayısal difüzyon getirir: tepe zamanla basıklaşır.","CFL kontrolü yorumsal değil hayatidir. dx küçülürse dt de küçülmelidir; 1 km çözünürlüklü bir modelin 10 km'lik modelden neden çok daha pahalı olduğunun cevabı buradadır.",'İki dizi (q, qn) kullanmak "eşzamanlı güncelleme" demektir; tek dizi ile yazarsanız yeni değerleri eski değer yerine kullanır ve farkında olmadan başka bir şema çözersiniz.',"Çıktıdaki integralin korunması ama tepenin alçalması tipik birinci-mertebe şema davranışıdır: kütle korunur, keskinlik kaybolur.","Gerçek modelde bu döngünün yerine yarı-Lagrange ya da spektral taşıma vardır; fikir aynı, sadece kesinlik ve izin verilen dt değişir."],output:"Ekrana tek satır: `CFL= 0.400  maks= 0.93xxx  integral= 6.27xxE+04`. Dosya olarak 201 satırlık advect_out.txt (x metre, q değeri). Tepe 400 adım × 200 s × 10 m/s = 800 km sağa kaymış, genliği ~%7 azalmış, tabanı genişlemiş olur.",pitfalls:["dt'yi 600 s yaparsanız CFL = 1.2 olur ve program `stop 1` ile durur. Kontrolü kaldırırsanız alan birkaç yüz adımda ±10^30 mertebesine fırlar.",'`q = qn` yerine iç döngüde doğrudan `q(i) = q(i) − cfl*(q(i)−q(i−1))` yazmak farklı (ve bu haliyle daha difüzif) bir şemadır; sonuç "çalışır" göründüğü için hata fark edilmez.',"Gauss tepesinin genişliği dx'in 2–3 katından küçük olursa ızgara onu temsil edemez; sonucu şemaya değil çözünürlüğe bağlayın.","`real` varsayılan olarak 4 bayttır. Uzun entegrasyonlarda `real(kind=8)` gerekebilir; aksi halde yuvarlama hatası birikir."],run:{level:"500",script:`set lev 500
set gxout shaded
set cmap rdbu
set cbar on
set title 500 hPa sicaklik adveksiyonu  -(u dT/dx + v dT/dy)
d -(u*ddx(t) + v*ddy(t))`,bridge:"Fortran tarayıcıda derlenmez. Soldaki program 1 boyutta adveksiyon terimini kendi ürettiği tepe üzerinde hesaplar; sağdaki çizim ise AYNI terimi (−u·∂T/∂x − v·∂T/∂y) gerçek Open-Meteo 500 hPa alanı üzerinde YolHava mini motorunun hesaplayıp boyaması sonucudur. Kırmızı: sıcak adveksiyon, mavi: soğuk adveksiyon. Kodu kendi makinenizde derlerseniz aynı sonlu-fark mantığı, aynı işaret kuralıyla çalışır."},level:2,tags:["adveksiyon","sonlu fark","CFL","upwind","kararlılık"]},{id:"fortran-diffusion2d",title:"2B difüzyon / Laplace — beş noktalı şablon ve kararlılık sınırı",lang:"fortran",goal:"İki boyutlu bir sıcaklık lekesinin difüzyonla nasıl yayıldığını çözmek; beş noktalı Laplas şablonunu ve r = K·dt/dx² ≤ 1/4 kararlılık koşulunu elle kurmak.",data:"Veri dosyası yok: 101×101 ızgara, 260 K arka alan, ortada 290 K'lik kare leke. K = 2×10⁴ m²/s (yatay karma katsayısı mertebesi).",code:`program diffuse2d
  implicit none
  integer, parameter :: nx = 101, ny = 101, nt = 5000
  real,    parameter :: dx = 10.0e3, dy = 10.0e3, kdif = 2.0e4
  real    :: t(nx,ny), tn(nx,ny), dt, r, err
  integer :: i, j, n

  dt = 0.2 * min(dx*dx, dy*dy) / kdif       ! kararlilik: r <= 1/4
  r  = kdif * dt / (dx*dx)
  print '(A,F9.1,A,F6.3)', 'dt = ', dt, ' s    r = ', r

  t = 260.0                                  ! arka alan (K)
  t(40:60, 40:60) = 290.0                    ! sicak leke

  do n = 1, nt
     tn = t
     do j = 2, ny-1
        do i = 2, nx-1
           t(i,j) = tn(i,j) + r * ( tn(i+1,j) + tn(i-1,j)   &
                                  + tn(i,j+1) + tn(i,j-1) - 4.0*tn(i,j) )
        end do
     end do
     t(1,:)  = t(2,:);   t(nx,:) = t(nx-1,:)  ! sifir aki (Neumann) kenar
     t(:,1)  = t(:,2);   t(:,ny) = t(:,ny-1)
     err = maxval(abs(t - tn))
     if (err < 1.0e-6) exit
  end do

  print '(A,I6,A,ES10.3)', 'adim = ', n, '   son degisim = ', err
  print '(A,F8.3,A,F8.3)', 'min = ', minval(t), '   maks = ', maxval(t)
  print '(A,F10.4)',       'ortalama (korunmali) = ', sum(t) / size(t)

  open(11, file='diffuse.bin', form='unformatted', access='stream')
  write(11) t
  close(11)
end program diffuse2d`,lineNotes:[{line:4,text:"dx = dy = 10 km; kdif yatay difüzyon katsayısı. Modellerde bu sayı fiziksel değil, sayısal gürültüyü söndürmek için seçilir."},{line:8,text:"dt doğrudan kararlılık koşulundan türetiliyor: r = K·dt/dx² ≤ 1/4. 0.2 katsayısı emniyet payı."},{line:12,text:"Tüm dizi tek atamayla dolduruluyor — döngü yok."},{line:13,text:"Dilim ataması: 40–60 indis aralığındaki kare bölgeye 290 K yazılıyor. Bu, keskin kenarlı bir başlangıç koşuludur."},{line:16,text:"tn = t: eski alanın tam kopyası. Beş noktalı şablon eski değerlerle hesaplanmalı."},{line:17,text:"İç noktalar üzerinde döngü; kenarlar ayrı ele alınacak."},{line:19,text:"Beş noktalı Laplas şablonu: dört komşunun toplamı eksi merkezin dört katı. Bu ifade ∇²T·dx²'e eşittir."},{line:22,text:"Neumann (sıfır akı) kenar: kenar değeri komşusuna eşitlenir, yani kenardan ısı kaçmaz."},{line:24,text:"İki adım arası en büyük değişim; denge ölçütü."},{line:25,text:"Değişim eşiğin altına inince erken çıkış. Laplace denkleminin çözümüne yakınsama budur."},{line:30,text:"Ortalama sıcaklık basılıyor: sıfır akı kenarla difüzyon toplam ısıyı KORUMALI. Sapma varsa şemada hata var demektir."},{line:32,text:"`access='stream'` ham ikili yazar: Python `np.fromfile` ya da GrADS `.ctl` ile doğrudan okunur."}],explain:['Difüzyon denklemi ∂T/∂t = K∇²T, atmosferde alt-ızgara karışımını temsil eder; modelde "yatay difüzyon" ya da "hyperdiffusion" adıyla geçer.',"Beş noktalı şablon Laplas işlecinin en ucuz ayrıklaştırmasıdır. Aynı şablon basınç çözücülerinde (Poisson denklemi) ve akım fonksiyonu tersinde de kullanılır.","Açık (explicit) şemada dt serbest değildir: r ≤ 1/4 koşulu ihlal edilirse çözüm dama tahtası deseniyle patlar. Örtük (implicit) şema bu sınırı kaldırır ama matris çözmeyi gerektirir.","Sıfır akı kenar koşulu toplam ısıyı korur; bu yüzden ortalama sıcaklık her adımda aynı kalmalıdır. Kodun sonundaki ortalama baskısı ücretsiz bir doğruluk testidir.","Erken çıkış (`exit`) alanın dengeye ulaştığını gösterir: difüzyon sonsuz zamanda Laplace denklemini (∇²T = 0) çözer, yani her nokta komşularının ortalaması olur.","Keskin kenarlı başlangıç koşulu ilk adımlarda ızgara ölçekli gürültü üretir; difüzyon onu hızla söndürür. Bu, modellerde difüzyonun asıl işidir."],output:"`dt = 2500.0 s    r = 0.250`, ardından yakınsama satırı (`adim` 5000 ya da eşiğe ulaşılan adım), min/maks ve ortalama. Ortalama başlangıçtakiyle 4–5 basamak aynı kalır. diffuse.bin dosyası 101×101×4 = 40 804 bayt ham float içerir; çizdirildiğinde keskin kare, kenarları yuvarlanmış bir kabarcığa dönüşmüştür.",pitfalls:["r > 0.25 (ör. katsayıyı 0.2 yerine 0.5 yapmak) çözümü kararsız kılar: komşu hücreler zıt işaretli salınıma girer, bir süre sonra Infinity.","`tn = t` satırını unutup t üzerinden okumak Jacobi yerine Gauss-Seidel çözer. Sonuç yine yakınsar ama farklı bir denklemi entegre etmiş olursunuz.","Fortran dizileri sütun-öncelikli (column-major): en içteki döngü BİRİNCİ indis (i) üzerinde olmalı. Ters yazarsanız önbellek kaçırma yüzünden 3–5 kat yavaşlarsınız.","`form='unformatted'` varsayılan olarak kayıt işaretleyicisi (record marker) ekler; `access='stream'` bunu engeller. Karıştırılırsa Python tarafında ilk 4 bayt bozuk okunur."],run:{level:"500",script:`set lev 500
set gxout shaded
set cmap rdbu
set cbar on
set title 500 hPa yukseklik alaninin Laplasyeni  lap(gh)
d lap(gh)`,bridge:"Fortran programı kendi ürettiği kare lekeye beş noktalı Laplas şablonunu uygular. Sağdaki çizim aynı işleci (∇²) gerçek 500 hPa jeopotansiyel yükseklik alanına uygular: mini motorun `lap()` fonksiyonu tam olarak kodun 19–20. satırındaki şablondur. Negatif (mavi) bölgeler yükseklik maksimumları — sırt; pozitif (kırmızı) bölgeler çukurlar. Jeostrofik yaklaşımda ∇²Z ile bağıl vortisite orantılıdır, bu yüzden bu harita bir vortisite haritasına benzer."},level:2,tags:["difüzyon","Laplas","beş noktalı şablon","kararlılık","sınır koşulu"]},{id:"fortran-netcdf-read",title:"NetCDF okuma — nf90_open / nf90_get_var ve hata denetimi",lang:"fortran",goal:"Bir ERA5/GFS NetCDF dosyasından boyutları öğrenip 3 boyutlu sıcaklık alanını belleğe almak; scale_factor/add_offset ile sıkıştırılmış tam sayı veriyi doğru ölçeklemek.",data:"era5_pl_20260115.nc — ERA5 basınç seviyesi dosyası. Değişkenler: t (K), z (m²/s²); boyutlar longitude, latitude, level, time.",code:`program read_t500
  use netcdf
  implicit none
  character(len=*), parameter :: fname = 'era5_pl_20260115.nc'
  integer :: ncid, vid, did, nlon, nlat, nlev
  real, allocatable :: t(:,:,:), lev(:)
  real    :: sf, ao
  integer :: k

  call chk( nf90_open(fname, nf90_nowrite, ncid) )

  call chk( nf90_inq_dimid(ncid, 'longitude', did) )
  call chk( nf90_inquire_dimension(ncid, did, len=nlon) )
  call chk( nf90_inq_dimid(ncid, 'latitude',  did) )
  call chk( nf90_inquire_dimension(ncid, did, len=nlat) )
  call chk( nf90_inq_dimid(ncid, 'level',     did) )
  call chk( nf90_inquire_dimension(ncid, did, len=nlev) )

  allocate(lev(nlev), t(nlon, nlat, nlev))
  call chk( nf90_inq_varid(ncid, 'level', vid) )
  call chk( nf90_get_var(ncid, vid, lev) )

  call chk( nf90_inq_varid(ncid, 't', vid) )
  call chk( nf90_get_var(ncid, vid, t, start=[1,1,1,1], count=[nlon,nlat,nlev,1]) )

  if (nf90_get_att(ncid, vid, 'scale_factor', sf) /= nf90_noerr) sf = 1.0
  if (nf90_get_att(ncid, vid, 'add_offset',   ao) /= nf90_noerr) ao = 0.0
  t = t * sf + ao
  call chk( nf90_close(ncid) )

  k = minloc(abs(lev - 500.0), dim=1)
  print '(A,I5,A,I5,A,I4)', 'izgara: ', nlon, ' x ', nlat, ' x ', nlev
  print '(A,F6.0,A,F7.2,A,F7.2)', 'seviye ', lev(k), ' hPa:  min ', &
        minval(t(:,:,k)), '  maks ', maxval(t(:,:,k))
  deallocate(t, lev)

contains
  subroutine chk(st)
    integer, intent(in) :: st
    if (st /= nf90_noerr) then
      print *, 'netCDF hata: ', trim(nf90_strerror(st))
      stop 2
    end if
  end subroutine chk
end program read_t500`,lineNotes:[{line:2,text:"`use netcdf`: netcdf-fortran kütüphanesinin modülü. Derlerken `-I$(nc-config --includedir)` ve `$(nf-config --flibs)` gerekir."},{line:6,text:"Boyutlar dosyadan okunacağı için diziler `allocatable`. Sabit boyut varsaymak en sık yapılan taşınabilirlik hatasıdır."},{line:10,text:"Dosya salt okunur açılıyor. Dönen `ncid` bundan sonraki tüm çağrılarda dosya kimliğidir."},{line:12,text:"Önce boyutun kimliği (`dimid`), sonra uzunluğu sorulur. İsimler dosyaya göre değişir: ERA5 `longitude`, GFS-NetCDF `lon`."},{line:19,text:"Boyutlar bilindikten sonra bellek ayrılıyor."},{line:23,text:"Değişkenin kimliği isimle bulunuyor. İsim yanlışsa burada hata alırsınız — sessizce sıfır okumazsınız."},{line:24,text:"`start`/`count` ile hiperslab: 4. boyut (time) yalnızca 1 adım okunuyor. Tüm dosyayı okumadan dilim almak budur."},{line:26,text:"scale_factor yoksa hata döner; onu yakalayıp 1.0 kullanıyoruz. `call chk` KULLANMIYORUZ çünkü yokluğu hata değil."},{line:28,text:"Paketlenmiş veriyi fiziksel birime çeviren tek satır. Bu satır unutulursa sıcaklıklar ~10⁴ mertebesinde çıkar."},{line:31,text:"`minloc(..., dim=1)` 500 hPa'ya en yakın seviyenin indisi. Seviye listesi her dosyada farklı sıralı olabilir."},{line:37,text:"İç alt program: her netCDF çağrısının dönüş kodunu denetler. Fortran'da istisna yoktur, kontrol elle yapılır."},{line:41,text:"`nf90_strerror` kodu insan okunur mesaja çevirir; hata ayıklamanın tek yolu budur."}],explain:["netCDF-Fortran arayüzünde her fonksiyon bir durum kodu döndürür; başarı `nf90_noerr` (0). Bu kodları denetlemeyen kod, bozuk dosyada sessizce çöp okur.","Erişim üç adımlıdır: dosyayı aç → boyut/değişken kimliğini isimle bul → veriyi oku. Kimlikler dosyaya özeldir, sabit varsayılamaz.","`start`/`count` hiperslab mekanizması NetCDF'in en değerli özelliğidir: 40 GB'lık bir dosyadan 2 MB'lık tek dilimi diske tek erişimle okur.","ERA5 verisi diskte int16 olarak saklanır; gerçek değer = ham·scale_factor + add_offset. Python/xarray bunu otomatik yapar, Fortran yapmaz — elle yazmak zorundasınız.","Fortran dizileri sütun-öncelikli, NetCDF ise satır-öncelikli (C sırası) tanımlıdır. Bu yüzden CDL'de `t(time, level, latitude, longitude)` görünen değişken Fortran'da `t(lon, lat, lev, time)` olarak okunur — indis sırası TERSTİR.","Bellek `allocatable` olduğu için ızgara çözünürlüğü değişse de kod değişmez; model ön/son işleyicilerinin taşınabilir olmasının sırrı budur."],output:"`izgara:   321 x   141 x  13` benzeri bir satır, ardından `seviye   500. hPa:  min  228.41  maks  271.03`. Hata durumunda tek satır netCDF mesajı (ör. `NetCDF: Variable not found`) ve `stop 2` ile 2 çıkış kodu.",pitfalls:["Boyut sırasını ters yazmak: CDL başlığında `t(time, level, latitude, longitude)` görürsünüz ama Fortran'da dizi `t(nlon, nlat, nlev, ntime)` olarak bildirilmelidir. Ters bildirim `nf90_get_var`'da \"Index exceeds dimension bound\" verir ya da daha kötüsü, sessizce karışık veri döndürür.","scale_factor/add_offset'i atlamak: ERA5'te sıcaklık 250 K yerine 15000 gibi çıkar. Değerler saçmaysa ilk bakılacak yer budur.","Gerçek `_FillValue` denetimi yapılmıyor; nem/yağış gibi maskeli alanlarda −32767 değerleri ortalamayı bozar. Üretimde `nf90_get_att(..., '_FillValue', fv)` ile maskeleyin.","Derleme bayrakları unutulursa `undefined reference to nf90_open_` linker hatası alırsınız: `gfortran read.f90 $(nf-config --fflags --flibs)` biçiminde derleyin."],run:{level:"850",script:`set lev 850
set gxout shaded+contour
set cmap thermal
set cint 2
set cbar on
set title 850 hPa sicaklik (C) - okunan alan
d t`,bridge:'Soldaki program bir NetCDF dosyasını açıp 3B sıcaklık dizisini belleğe alır ve o dilimin min/maks değerini basar. Tarayıcıda netCDF kütüphanesi yoktur; sağdaki harita aynı fiziksel alanı (850 hPa sıcaklık) Open-Meteo\'dan canlı çekip YolHava mini motorunun çizmesidir. Yani kodun okuduğu diziyi "gözle görmüş" oluyorsunuz: aynı veriyi kendi makinenizde okuduğunuzda `minval/maxval` değerleri buradaki renk ölçeğinin uçlarıyla örtüşür.'},level:2,tags:["NetCDF","veri okuma","hiperslab","scale_factor","hata denetimi"]},{id:"fortran-module-theta",title:"Modül + elemental fonksiyon — potansiyel ve eşdeğer potansiyel sıcaklık",lang:"fortran",goal:"Sıcaklık ve basınçtan potansiyel sıcaklık (θ) ile eşdeğer potansiyel sıcaklığı (θe) hesaplayan, tek değer için de tüm dizi için de çalışan yeniden kullanılabilir bir modül yazmak; sonucu statik kararlılık testinde kullanmak.",data:"Kod içinde altı seviyelik örnek sondaj: p (hPa), T (K), karışım oranı r (kg/kg). Gerçek kullanımda bu diziler NetCDF'ten gelir.",code:`module termo
  implicit none
  private
  public :: theta, theta_e, p0
  real, parameter :: p0    = 1000.0     ! referans basinc (hPa)
  real, parameter :: kappa = 0.2854     ! Rd/cp
  real, parameter :: lv    = 2.501e6    ! buharlasma gizli isisi (J/kg)
  real, parameter :: cp    = 1005.7     ! J/(kg K)
contains
  elemental real function theta(tk, p)
    real, intent(in) :: tk, p           ! K, hPa
    theta = tk * (p0 / p) ** kappa
  end function theta

  elemental real function theta_e(tk, p, r)
    real, intent(in) :: tk, p, r        ! r: karisim orani (kg/kg)
    theta_e = theta(tk, p) * exp(lv * r / (cp * tk))
  end function theta_e
end module termo

program sondaj
  use termo
  implicit none
  integer, parameter :: n = 6
  real    :: p(n), tk(n), r(n), th(n), the(n)
  integer :: k

  p  = [1000.0,  925.0,  850.0,  700.0,  500.0,  300.0]
  tk = [ 291.2,  286.4,  281.9,  272.1,  254.3,  228.6]
  r  = [0.0110, 0.0092, 0.0074, 0.0040, 0.0011, 0.0001]

  th  = theta(tk, p)            ! elemental: dizi girer, dizi cikar
  the = theta_e(tk, p, r)

  print '(A)', '     p       T     theta   theta_e'
  do k = 1, n
    print '(F8.1,F8.2,F9.2,F10.2)', p(k), tk(k), th(k), the(k)
  end do

  if (any(th(2:n) - th(1:n-1) < 0.0)) then
    print *, 'UYARI: theta yukariya dogru azaliyor -> statik KARARSIZ katman'
  else
    print *, 'theta yukariya dogru artiyor -> statik kararli'
  end if
  print '(A,F7.2,A)', 'yuzey-500 hPa theta_e farki: ', the(5) - the(1), ' K'
end program sondaj`,lineNotes:[{line:3,text:"`private`: modüldeki her şey varsayılan olarak gizli. Bu, ad çakışmasını önleyen doğru alışkanlıktır."},{line:4,text:"Yalnız dışarıya açılacaklar `public`. kappa, lv, cp içeride kalır."},{line:6,text:"κ = Rd/cp ≈ 287/1005.7. Poisson denkleminin üssü budur."},{line:10,text:"`elemental`: fonksiyon skaler için yazılır ama derleyici onu otomatik olarak dizilere de uygular. Fortran'ın en verimli soyutlamalarından biri."},{line:12,text:"Poisson denklemi: θ = T·(p₀/p)^κ. Havanın 1000 hPa'ya kuru-adyabatik indirilse alacağı sıcaklık."},{line:17,text:"θe yaklaşık formülü: θ, gizli ısının serbest kalmasıyla kazanılacak ısıtma kadar büyütülür. Modül içinde theta'yı çağırmak iç tutarlılığı sağlar."},{line:22,text:"`use termo`: modülü içeri alır. Derleme sırası önemlidir — modül önce derlenmeli (.mod dosyası üretilir)."},{line:29,text:"Basınç dizisi azalan sırada: sondaj yukarı doğru gidiyor."},{line:33,text:"Tek satırda 6 elemanlı dizi için θ hesaplanıyor; döngü yok. `elemental` sayesinde."},{line:41,text:"`any(...)`: θ'nın yukarı doğru azaldığı bir katman var mı? Statik kararsızlığın tanımı budur."},{line:46,text:"θe farkı konvektif potansiyeli kabaca ölçer: yüzeyde yüksek, yukarıda düşük θe → nemli-kararsız dizilim."}],explain:["Potansiyel sıcaklık, hava parselini adyabatik olarak 1000 hPa'ya getirdiğinizde ölçeceğiniz sıcaklıktır. Kuru adyabatik süreçte korunur, bu yüzden hava kütlelerini izlemek için sıcaklıktan çok daha kullanışlıdır.","θ'nın yükseklikle artması statik kararlılığın tanımıdır: parsel yukarı itildiğinde çevresinden soğuk kalır ve geri döner. Azalıyorsa katman kendiliğinden devrilir.","θe ayrıca gizli ısıyı da sayar ve doymuş yükselişte korunur. Konvektif kararsızlık ölçütü (∂θe/∂z < 0) bu yüzden θ yerine θe ile tanımlanır.","`elemental` niteleyicisi fonksiyonu hem skaler hem dizi için geçerli kılar; derleyici çağrıyı vektörleştirebilir. Aynı işi arayüz blokları ile elle yazmak gerekseydi kod üç katına çıkardı.","Modül tasarımı modelin kendi mimarisidir: WRF/ICON içinde yüzlerce `module` vardır ve fiziksel sabitler tek bir yerde tanımlanır. Sabiti iki yere yazmak, iki farklı fizik demektir.",`Formülün girdisi Kelvin ve hPa'dır. Birimi karıştırmak sessiz bir hatadır: Celsius verirseniz sonuç "çalışır" ama fiziksel olarak anlamsızdır.`],output:"Altı satırlık tablo (p, T, θ, θe) ve ardından kararlılık satırı. Verilen sondajda θ 291 K'den ~334 K'ye kadar artar, yani `theta yukariya dogru artiyor -> statik kararli` basılır. Son satırda yüzey ile 500 hPa arasındaki θe farkı negatiftir: nemli-kararsız dizilim, yani yükselen doymuş parsel çevresinden sıcak kalabilir.",pitfalls:["Sıcaklığı Celsius vermek: formül hata vermez, sadece yanlış θ üretir. Modülün başına `if (tk < 100.0) error stop` gibi bir korkuluk koymak ucuz bir sigortadır.","Basıncı Pa cinsinden vermek: p₀ = 1000 hPa ile oran 100 kat kayar, θ çok küçük çıkar. Birim seçimini modülün belgesinde net yazın.","Modülü ana programdan sonra derlemek: `gfortran sondaj.f90 termo.f90` sırası hata verir. Doğrusu `gfortran termo.f90 sondaj.f90` ya da tek dosyada modülü önce yazmaktır.","`elemental` fonksiyonlar `pure` olmak zorundadır: içinde G/Ç (print, write) ya da global değişken değişimi yapamazsınız. Hata ayıklamak için print eklerseniz derleme kırılır."],run:{level:"500",script:`set lev 500
set gxout shaded+contour
set cmap thermal
set cint 3
set cbar on
set title 500 hPa potansiyel sicaklik  theta = T*(1000/500)^0.2854
d (t+273.15)*pow(2,0.2854) - 273.15`,bridge:"Soldaki modül altı noktalık bir sondaj için θ hesaplar. Sağdaki harita AYNI Poisson formülünü tüm 500 hPa ızgarasına uygular: mini motor t değerini Kelvin'e çevirip (1000/500)^0.2854 = 2^0.2854 ile çarpar, sonra ekranda okunsun diye tekrar Celsius'a döner. Yani kodun 12. satırındaki tek satırlık formülün yeryüzü ölçeğindeki görüntüsü budur: θ alanı sıcaklık alanından daha düzgün görünür, çünkü basınç etkisi arındırılmıştır."},level:2,tags:["modül","elemental","potansiyel sıcaklık","termodinamik","statik kararlılık"]},{id:"fortran-array-syntax",title:"Dizi sözdizimi, maske ve merge — döngü yazmadan alan işlemek",lang:"fortran",goal:"Küresel bir rüzgâr alanında jet bölgelerini (≥ 30 m/s, |enlem| > 20°) döngü yazmadan maskelemek; where, merge, count, maxloc gibi dizi işlevlerinin ne zaman döngünün yerine geçtiğini görmek.",data:"Sentetik 360×181 (1°) rüzgâr alanı; random_number ile üretilir. Gerçek kullanımda u/v NetCDF'ten okunur.",code:`program dizi_sozdizimi
  implicit none
  integer, parameter :: nx = 360, ny = 181
  real    :: u(nx,ny), v(nx,ny), ws(nx,ny), jet(nx,ny), lat(ny)
  logical :: mask(nx,ny)
  integer :: j

  call random_number(u);  u = (u - 0.5) * 80.0      ! -40..40 m/s
  call random_number(v);  v = (v - 0.5) * 40.0
  lat = [ (real(j) - 91.0, j = 1, ny) ]             ! -90 .. +90

  ws = sqrt(u*u + v*v)          ! tum izgara tek satirda; hicbir dongu yok

  mask = (ws >= 30.0) .and. (abs(spread(lat, dim=1, ncopies=nx)) > 20.0)

  jet = 0.0
  where (mask) jet = ws         ! maskeli atama

  print '(A,I8)',   'jet nokta sayisi : ', count(mask)
  print '(A,F8.2)', 'en buyuk hiz     : ', maxval(ws)
  print '(A,2I5)',  'maksimum konumu  : ', maxloc(ws)
  print '(A,F8.2)', 'jet ort. hizi    : ', sum(jet) / max(count(mask), 1)

  ! Kuzey yarim kure dilimi: indis araligi yeter, kopyalama yok
  print '(A,F8.2)', 'KYK ort. hiz     : ', sum(ws(:, 92:ny)) / size(ws(:, 92:ny))

  ! merge: eleman bazli if/else. Ucuncu argüman mantiksal maske.
  jet = merge(ws, 0.0, mask)
  print '(A,F8.2)', 'merge ile ayni   : ', sum(jet) / max(count(mask), 1)

  ! Dilim + azaltma islevi birlikte: her 30 enlemde bir bolgesel ortalama
  do j = 1, ny, 30
    print '(A,F7.1,A,F7.2)', 'enlem ', lat(j), '  ort. hiz ', sum(ws(:,j)) / nx
  end do
end program dizi_sozdizimi`,lineNotes:[{line:5,text:"Mantıksal dizi: her ızgara noktası için bir bayrak. Maskeleri ayrı değişkende tutmak kodu okunur kılar."},{line:8,text:"random_number yerinde doldurur; ardından dizi aritmetiğiyle −40..40 aralığına ölçekleniyor."},{line:10,text:"Örtük do (implied do) ile dizi kurucu: j = 1..181 için −90..+90 enlemleri."},{line:12,text:"Tüm 65 160 nokta için rüzgâr hızı tek satırda. Derleyici bunu vektörleştirir; elle yazılan döngüden hızlıdır."},{line:14,text:"spread(lat, dim=1, ncopies=nx): (ny) boyutlu enlem dizisini (nx,ny) boyutuna yayar. Böylece maske iki koşulu aynı şekilde karşılaştırabilir."},{line:17,text:"`where` yapısı: yalnız maske doğru olan elemanlara atama yapar. Diğerleri dokunulmadan kalır."},{line:19,text:"count(mask): doğru eleman sayısı. Bir döngü + sayaç yazmaya gerek yok."},{line:21,text:"maxloc(ws) iki elemanlı bir indis vektörü döndürür: (i, j). Formatta `2I5` bu yüzden."},{line:22,text:"count sıfır olabileceği için max(..., 1) ile sıfıra bölme engelleniyor."},{line:25,text:"Dizi dilimi ws(:, 92:ny) yeni bellek ayırmadan kuzey yarımküreyi ifade eder."},{line:28,text:"merge(a, b, mask): maske doğruysa a, değilse b. `where` ile aynı sonucu ifade dahilinde verir, atama gerektirmez."},{line:32,text:"Döngünün üçüncü parametresi adım: 1, 31, 61, ... enlemler. Klasik do döngüsü hâlâ gerekli olduğunda kullanılır."}],explain:[`Fortran'ın diğer dillerden ayrıldığı asıl nokta budur: dizi bir "ilk sınıf" tiptir. ws = sqrt(u*u + v*v) ifadesi bir milyon noktalı alan için de aynı biçimde yazılır.`,"Dizi sözdizimi yalnız estetik değil, başarım meselesidir: derleyici döngü sınırlarını kendi seçer, SIMD komutlarına çevirir, gereksiz sınır denetimini atar.",'`where` bloğu ve merge işlevi meteorolojide sürekli gerekir: "yalnız kara noktalarında", "yalnız 850 hPa\'nın yer seviyesinin üstünde olduğu yerde", "yalnız yağışın 1 mm\'yi geçtiği hücrelerde" gibi koşullu hesaplar.',"count, sum, maxval, minloc, any, all azaltma (reduction) işlevleridir; alan istatistiğini tek satırda verir ve paralelleştirilmeleri kolaydır.","spread boyut uyumsuzluğunu çözer. Enlem yalnız j'ye bağlıdır ama maske (i,j) boyutlu olmalıdır; NumPy'daki yayılımın (broadcasting) elle yazılmış hali budur.","Dilim gösterimi ws(:, 92:ny) kopya üretmeyebilir. Fortran'da alt dizi geçirmek ucuzdur; bu da alan hesaplarını doğal biçimde parçalara bölmeyi mümkün kılar."],output:"Yaklaşık şu satırlar: `jet nokta sayisi : 18xxx`, `en buyuk hiz : 5x.xx`, `maksimum konumu : i j`, `jet ort. hizi : 3x.xx` ve `merge ile ayni` satırında birebir aynı sayı. Ardından yedi enlem için bölgesel ortalama listesi. Rastgele veri kullanıldığı için sayılar her çalıştırmada değişir; where ve merge sonuçlarının AYNI çıkması önemlidir.",pitfalls:["spread boyutunu ters vermek (dim=2) sessizce yanlış şekilli dizi üretir; derleyici çoğu zaman şikâyet eder, etmezse maske tamamen anlamsız olur. Boyutu her zaman shape() ile doğrulayın.","`where (mask) jet = ws` yalnız ATAMA yapar; where bloğu içinde fonksiyon çağırıp yan etki beklerseniz çalışmaz. Karmaşık koşullar için merge ya da açık döngü kullanın.","Dizi geçici değişkenleri: a = b + c * d gibi zincirlerde derleyici geçici dizi ayırabilir. Çok büyük alanlarda bellek zirvesi beklenmedik biçimde ikiye katlanır; -fcheck=all ve profil ile izleyin.","sum(jet) / count(mask) karışık aritmetiktir ve gerçel sonuç verir, ama count(mask)/2 gibi ifadeler TAM SAYI böler. Ortalama hesaplarken bölenin tipine dikkat edin."],run:{level:"250",script:`set lev 250
set gxout shaded
set cmap magma
set cbar on
set title 250 hPa jet maskesi: 30 m/s ustu fazlalik
d max(ws-30,0)`,bridge:'Fortran programı `where (ws >= 30.0) jet = ws` ile bir maske kurar; tarayıcıda Fortran derlenemediği için aynı fikir mini motorda max(ws-30,0) olarak yazıldı: 30 m/s\'nin altındaki her yer sıfır, üstündeki yerler fazlalıkları kadar renkli. İkisi de "eşik üstü bölgeyi ayır" işlemidir; gerçek 250 hPa rüzgâr alanında jet akımının nerede olduğunu doğrudan gösterir.'},level:2,tags:["dizi sözdizimi","where","merge","maske","vektörleştirme"]},{id:"fortran-openmp",title:"OpenMP — paylaşımlı bellekte paralel döngü ve indirgeme",lang:"fortran",goal:"Büyük bir 3B rüzgâr alanında hız hesabını çok çekirdeğe dağıtmak; collapse, schedule ve reduction yönergelerinin ne işe yaradığını ölçerek görmek.",data:"Sentetik 1440×721×40 (≈41 milyon nokta, 0.25° × 40 seviye) u/v alanı. Bellek: 3 dizi × 4 bayt ≈ 500 MB.",code:`program omp_ws
  use omp_lib
  implicit none
  integer, parameter :: nx = 1440, ny = 721, nz = 40
  real,    allocatable :: u(:,:,:), v(:,:,:), ws(:,:,:)
  real(kind=8) :: t0, t1
  real    :: gmax
  integer :: i, j, k

  allocate(u(nx,ny,nz), v(nx,ny,nz), ws(nx,ny,nz))
  call random_number(u);  u = u * 60.0 - 30.0
  call random_number(v);  v = v * 60.0 - 30.0

  t0 = omp_get_wtime()
  !$omp parallel do collapse(2) schedule(static) default(shared) private(i)
  do k = 1, nz
     do j = 1, ny
        do i = 1, nx
           ws(i,j,k) = sqrt(u(i,j,k)**2 + v(i,j,k)**2)
        end do
     end do
  end do
  !$omp end parallel do
  t1 = omp_get_wtime()

  gmax = -1.0
  !$omp parallel do collapse(2) reduction(max:gmax)
  do k = 1, nz
     do j = 1, ny
        gmax = max(gmax, maxval(ws(:,j,k)))
     end do
  end do
  !$omp end parallel do

  print '(A,I4)',     'is parcacigi : ', omp_get_max_threads()
  print '(A,F8.3,A)', 'sure         : ', t1 - t0, ' s'
  print '(A,F8.2)',   'maks hiz     : ', gmax
  print '(A,F8.2)',   'seri kontrol : ', maxval(ws)
  deallocate(u, v, ws)
end program omp_ws`,lineNotes:[{line:2,text:"`use omp_lib`: omp_get_wtime, omp_get_max_threads gibi çalışma zamanı işlevlerini getirir. Yönergeler için şart değil, ölçüm için gerekli."},{line:5,text:"500 MB'lık diziler yığında (stack) tutulamaz; allocatable ile heap'e alınır."},{line:6,text:"Zaman ölçümü çift duyarlıklı olmalı: tek duyarlıkta saniye çözünürlüğü yetersiz kalır."},{line:14,text:"omp_get_wtime() duvar saati döndürür; cpu_time paralel kodda toplam çekirdek süresini verdiği için yanıltır."},{line:15,text:"Yönerge satırı `!$omp` ile başlar; OpenMP kapalı derlenirse bu satır yorum sayılır. collapse(2) k ve j döngülerini tek havuzda birleştirir (nz = 40 tek başına çok çekirdeği doyurmaz). schedule(static) eşit iş yükü için en ucuz bölüşüm."},{line:18,text:"En içteki döngü paralelleştirilmez: bellek sıralı taranır, önbellek dostu kalır."},{line:26,text:"reduction(max:gmax): her iş parçacığı kendi yerel maksimumunu tutar, sonunda derleyici bunları birleştirir. Yarış koşulu oluşmaz."},{line:29,text:"maxval(ws(:,j,k)) iç azaltmayı zaten vektörleştirir; paralellik dış iki döngüde."},{line:34,text:"Kaç iş parçacığıyla çalıştığını basar. OMP_NUM_THREADS=8 ./omp_ws ile dışarıdan ayarlanır."},{line:37,text:"Seri maxval ile karşılaştırma: paralel indirgeme doğru çalıştıysa iki sayı BİREBİR aynı olmalı."}],explain:["OpenMP, paylaşımlı bellekli bir makinede (tek düğüm, çok çekirdek) döngüleri paralelleştirmenin en ucuz yoludur: kodu değiştirmezsiniz, üstüne yönerge yazarsınız.","collapse(N) iç içe döngüleri birleştirir. Dış döngünün yineleme sayısı çekirdek sayısından azsa çekirdekler boş kalır; collapse bu dengesizliği çözer.","reduction yan etkili birikimleri (toplam, maksimum, minimum) güvenli yapar. Onsuz gmax = max(gmax, ...) yazmak klasik bir yarış koşuludur: sonuç her çalıştırmada değişebilir.",'Zamanlama omp_get_wtime ile yapılmalıdır. cpu_time tüm çekirdeklerin harcadığı süreyi toplar; paralelleştirdikçe "yavaşlıyormuş" gibi görünür.',"Hızlanma genelde çekirdek sayısıyla orantılı değildir. Bu döngü bellek bant genişliği sınırlıdır (her nokta için iki okuma, bir yazma, tek karekök): 8 çekirdekte tipik olarak 3–4 kat hızlanma görülür.","Model çekirdeklerinde OpenMP genelde MPI ile birlikte kullanılır: MPI düğümler arasında alanı böler, OpenMP düğüm içinde döngüleri dağıtır. Bu hibrit yaklaşım operasyonel NWP'nin standardıdır."],output:"`is parcacigi :    8`, `sure : 0.2xx s` (tek çekirdekte ~0.9 s), `maks hiz : 42.4x` ve `seri kontrol` satırında aynı sayı. İki maksimum farklıysa indirgeme yanlış yazılmış demektir. OMP_NUM_THREADS değiştirilerek hızlanma eğrisi çıkarılabilir.",pitfalls:['Derlerken -fopenmp (gfortran) veya -qopenmp (ifort) bayrağını unutmak: program derlenir, çalışır, ama tek çekirdekte kalır ve omp_get_max_threads() 1 basar. Sessiz "paralel sanma" hatası budur.',"reduction yerine doğrudan gmax = max(gmax, ...) yazmak yarış koşulu üretir. Sonuç çoğu zaman doğru görünür, ara sıra yanlış çıkar — en zor yakalanan hata türü.","Paralel bölge içinde print kullanmak: çıktı satırları birbirine karışır ve senkronizasyon maliyeti ölçümü bozar. Hata ayıklamak için kritik bölgeye alın ya da sonradan basın.","İlk dokunuş (first touch) etkisi: NUMA makinelerinde diziyi seri doldurup paralel okumak bellek erişimini uzaklaştırır. Büyük alanlarda ilk doldurmayı da aynı paralel düzenle yapın."],run:{level:"250",script:`set lev 250
set gxout shaded
set cmap viridis
set cbar on
set title 250 hPa ruzgar hizi  ws = sqrt(u^2 + v^2)
d mag(u,v)`,bridge:"Fortran programı 41 milyon nokta için sqrt(u²+v²) hesabını çekirdeklere bölüştürür ve süreyi ölçer. Tarayıcıda OpenMP yoktur; sağdaki harita aynı ifadeyi (mag(u,v)) gerçek 250 hPa alanında YolHava mini motorunun tek iş parçacığıyla hesaplayıp çizmesidir. Hesabın KENDİSİ aynı; farklı olan yalnız ölçek ve dağıtım. Renk ölçeğinin en parlak şeridi jet akımıdır."},level:3,tags:["OpenMP","paralel","collapse","reduction","başarım"]}]},{id:"matlab",title:"MATLAB / Octave — matris doğal tiptir",emoji:"🟥",intro:'MATLAB (ve açık kaynaklı ikizi Octave) meteorolojide çoğunlukla "hızlı bak-gör ve analiz et" işini görür: NetCDF dilimi oku, alanı çiz, türev al, zaman serisini süz. Güçlü yanı matrisin doğal tip olması ve çizim işlevlerinin hazır gelmesi; zayıf yanı büyük veri ve lisans. Bu grupta veri okumadan palet seçimine, vektör alanından vortisiteye ve spektral analize kadar tipik bir analiz zincirini kuruyoruz.',examples:[{id:"matlab-ncread",title:"ncinfo / ncread — dosyayı tanı, sadece gereken dilimi oku",lang:"matlab",goal:"Bir ERA5 basınç seviyesi dosyasının içeriğini keşfetmek ve 500 hPa jeopotansiyel yükseklik alanını tüm dosyayı belleğe almadan okumak.",data:"era5_pl_20260115.nc — değişkenler z (m²/s²), t (K); boyutlar longitude, latitude, level, time.",code:`% ERA5/GFS NetCDF: once basligi tani, sonra dilimi oku
f = 'era5_pl_20260115.nc';
info = ncinfo(f);
fprintf('degiskenler: %s\\n', strjoin({info.Variables.Name}, ', '));
for i = 1:numel(info.Dimensions)
    fprintf('  %-12s %d\\n', info.Dimensions(i).Name, info.Dimensions(i).Length);
end

lon  = double(ncread(f, 'longitude'));
lat  = double(ncread(f, 'latitude'));
lev  = ncread(f, 'level');
tval = ncread(f, 'time');

k = find(lev == 500, 1);
if isempty(k)
    error('500 hPa seviyesi dosyada yok: [%s]', num2str(lev(:)'));
end

% z: lon x lat x level x time -> yalniz 1 dilim oku (bellek dostu)
z  = ncread(f, 'z', [1 1 k 1], [Inf Inf 1 1]);
gh = double(squeeze(z)) / 9.80665;          % m^2/s^2 -> gpm

% Zaman: ERA5 'hours since 1900-01-01'
fprintf('zaman birimi: %s\\n', ncreadatt(f, 'time', 'units'));
tt = datetime(1900,1,1) + hours(double(tval(1)));

fprintf('%s | 500 hPa gh: %.0f - %.0f gpm | ortalama %.0f\\n', ...
        datestr(tt, 'yyyy-mm-dd HH:MM'), min(gh(:)), max(gh(:)), mean(gh(:)));

% Enlemi artan yap: cizim islevleri bunu bekler
if lat(1) > lat(end)
    lat = flipud(lat);
    gh  = fliplr(gh);            % gh: lon x lat oldugundan 2. eksen
end
save('gh500.mat', 'lon', 'lat', 'gh', 'tt');`,lineNotes:[{line:3,text:"ncinfo dosyanın tüm üstverisini bir yapı (struct) olarak döndürür: değişkenler, boyutlar, öznitelikler. Veriyi OKUMAZ, sadece başlığı."},{line:4,text:"Yapı dizisinden alan çıkarma: {info.Variables.Name} bir hücre dizisidir; strjoin onu tek satıra çevirir."},{line:5,text:"Boyut adlarını ve uzunluklarını listeler. ERA5 longitude/latitude, GFS-NetCDF lon/lat kullanır; kodu körlemesine kopyalamayın."},{line:9,text:"double() dönüşümü önemli: NetCDF single ya da int16 döndürebilir, karışık tipte aritmetik sessizce duyarlık kaybettirir."},{line:14,text:"find(..., 1) ilk eşleşmenin indisini verir. Seviye listesi dosyaya göre artan ya da azalan olabilir."},{line:15,text:"Seviye yoksa erken hata: sessizce boş dizi ile devam etmek yerine anlamlı mesaj."},{line:20,text:'ncread(f, ad, start, count): hiperslab. Inf "bu boyutun tamamı" demektir. Bu satır 40 GB dosyadan 2 MB okur.'},{line:21,text:"Jeopotansiyeli (m²/s²) standart yerçekimine bölerek jeopotansiyel metreye (gpm) çevirir. ERA5'te z HER ZAMAN m²/s²'dir."},{line:24,text:"Zaman biriminin kendisini okuyup basıyoruz: başlangıç tarihi dosyadan dosyaya değişir (1900, 1970, 1800...)."},{line:25,text:"Saat sayısını datetime'a çeviriyoruz. Dönem (epoch) yanlışsa tarih onlarca yıl kayar."},{line:30,text:"ERA5'te enlem 90 → −90 sırasındadır. contour/pcolor artan eksen bekler; burada düzeltilmezse harita baş aşağı çıkar."},{line:33,text:"gh dizisi lon×lat olduğu için enlem ikinci boyuttur: fliplr doğru seçim, flipud yanlış olurdu."}],explain:["MATLAB'ın NetCDF arayüzü iki katmanlıdır: yüksek seviyeli ncinfo/ncread/ncreadatt ve düşük seviyeli netcdf.* paketi. Günlük işin %95'i yüksek seviyeliyle görülür.","Önce başlığı okumak bir alışkanlık değil zorunluluktur: değişken adı, boyut sırası ve birim her üretici için farklıdır. Kör kopyalanan kodun çoğu burada kırılır.","start/count ile dilim okumak belleği ve süreyi tek başına on kat düşürür. Tüm değişkeni okuyup sonra dilimlemek en yaygın verimsizliktir.","Jeopotansiyel ile jeopotansiyel yükseklik karıştırılır: z/9.80665 dönüşümü yapılmazsa haritadaki sayılar 50 000 mertebesinde çıkar ve kontur aralıkları anlamsızlaşır.","Enlem yönü, meteorolojik veride en sık görülen sessiz hatadır. Harita baş aşağı çıkmazsa bile türev işaretleri (kuzey-güney gradyanı) ters döner.","save/.mat ile ara sonucu kaydetmek sonraki örneklerin girdisidir; analiz zincirini parçalara bölmek büyük veride tekrar okuma maliyetini ortadan kaldırır."],output:"Değişken ve boyut listesi, zaman birimi satırı, ardından `2026-01-15 00:00 | 500 hPa gh: 4870 - 5910 gpm | ortalama 5520` benzeri bir özet. Çalışma dizinine gh500.mat yazılır (lon, lat, gh, tt).",pitfalls:["Boyut sırası: MATLAB ncread dizileri dosyadaki C sırasının TERSİNE döndürür. CDL'de z(time, level, latitude, longitude) görünen değişken MATLAB'da lon×lat×level×time gelir. Transpoz gerekip gerekmediğini size() ile doğrulayın.","int16 paketli veride ncread scale_factor/add_offset'i otomatik uygular ama sonuç single olur; double'a çevirmezseniz türev hesaplarında duyarlık kaybedersiniz.",'datetime dönemi elle yazıldı. Farklı bir dosyada birim "hours since 1970-01-01" olabilir; ncreadatt çıktısını okumadan tarih hesaplamayın.',"Octave'da ncread yerine netcdf paketi (pkg load netcdf) gerekir ve ncinfo yoktur; taşınabilir betikte bu farkı if exist('ncinfo') ile yönetin."],run:{level:"500",script:`set lev 500
set gxout contour
set cint 60
set cbar off
set title 500 hPa jeopotansiyel yukseklik (gpm) - okunan dilim
d gh`,bridge:"MATLAB kodu dosyadan tek bir 500 hPa dilimi okuyup min/maks değerini basar. Tarayıcıda MATLAB yorumlayıcısı yok; sağdaki kontur haritası aynı büyüklüğü (gh) Open-Meteo'dan canlı alıp mini motorun 60 gpm aralıklarla çizmesidir. Kodu çalıştırdığınızda gh değişkeninin içinde tam olarak bu alanın sayıları olur."},level:1,tags:["NetCDF","ncread","hiperslab","jeopotansiyel","veri okuma"]},{id:"matlab-colormap",title:"contourf ve renk paleti — jet neden yalan söyler",lang:"matlab",goal:"500 hPa yükseklik alanını doldurulmuş konturla çizmek ve aynı veriyi algısal olarak eşit adımlı bir palet (parula/viridis) ile jet paletinde yan yana koyarak farkı gözle görmek.",data:"Bir önceki örneğin ürettiği gh500.mat (lon, lat, gh).",code:`load('gh500.mat');                    % lon, lat, gh (lon x lat)
GH = gh.';                            % cizim icin lat x lon
[LON, LAT] = meshgrid(lon, lat);
lv = 4800:60:6000;                    % klasik 60 gpm araligi

% Algisal olarak esit adimli palet: MATLAB'da parula, Octave'da viridis
if exist('viridis', 'file'), cmA = viridis(64); else, cmA = parula(64); end

figure('Color', 'w', 'Position', [80 80 1180 460]);

ax1 = subplot(1,2,1);
contourf(LON, LAT, GH, lv, 'LineColor', 'none');
colormap(ax1, cmA); caxis([4900 5900]); colorbar;
title('parula / viridis - esit algisal adim');
xlabel('boylam'); ylabel('enlem'); axis image;

ax2 = subplot(1,2,2);
contourf(LON, LAT, GH, lv, 'LineColor', 'none');
colormap(ax2, jet(64)); caxis([4900 5900]); colorbar;
title('jet - olmayan kenarlar uretir');
xlabel('boylam'); ylabel('enlem'); axis image;

% Ayni veriyi gri tonlamaya cevir: jet gri basildiginda bilgi cokuyor
figure('Color', 'w');
subplot(1,2,1);
imagesc(lon, lat, GH); colormap(gca, gray(64)); set(gca, 'YDir', 'normal');
title('gri: siralama korunur');
subplot(1,2,2);
jg = jet(64);
jgray = repmat(0.2989*jg(:,1) + 0.5870*jg(:,2) + 0.1140*jg(:,3), 1, 3);
imagesc(lon, lat, GH); colormap(gca, jgray); set(gca, 'YDir', 'normal');
title('jet''in gri karsiligi: sira bozulur');

exportgraphics(figure(1), 'gh500_palet.png', 'Resolution', 200);`,lineNotes:[{line:2,text:"Transpoz: contourf(X, Y, Z) çağrısında Z'nin SATIRLARI Y'ye (enlem), sütunları X'e (boylam) karşılık gelmelidir."},{line:3,text:"meshgrid iki eksen vektöründen 2B koordinat matrisleri üretir. contourf bunları kabul eder."},{line:4,text:"60 gpm, 500 hPa haritalarının uzlaşımsal kontur aralığıdır; sabit aralık haritaları karşılaştırılabilir kılar."},{line:7,text:"viridis MATLAB'da yoktur, Octave'da vardır. exist ile kontrol etmek betiği iki ortamda da çalıştırır."},{line:12,text:"LineColor none: dolgulu konturda ince çizgiler kalabalık yapar; kontur çizgisi ayrıca contour ile eklenir."},{line:13,text:"Her eksen için AYRI palet: colormap(ax, cm) biçimi kullanılmazsa iki alt grafik aynı paleti paylaşır."},{line:13,text:"caxis ile renk sınırlarını sabitlemek şarttır; yoksa iki panel farklı ölçeklenir ve karşılaştırma anlamsızlaşır."},{line:15,text:"axis image: birim boylam ile birim enlem aynı piksel boyunu alır, harita gerilmez."},{line:26,text:"imagesc ham hücreleri boyar (kontur yok): palet etkisini saf görmek için daha uygun."},{line:26,text:"imagesc y eksenini ters çizer; YDir normal ile düzeltilir."},{line:30,text:"jet paletinin ITU-R BT.601 ağırlıklarıyla gri karşılığı hesaplanıyor."},{line:31,text:"Gri kopya, paletin monoton olup olmadığının testidir: jet'in grisi ortada parlayıp iki uçta koyulaşır, yani sıralama kaybolur."},{line:34,text:"exportgraphics kenar boşluklarını kırpıp istenen çözünürlükte yazar; saveas/print'e göre yayın için daha temizdir."}],explain:["Renk paleti bir görselleştirme süsü değil, veriyi okuma aracıdır. Palet algısal olarak eşit adımlı değilse, eşit veri farkları göze eşit görünmez.",'jet paleti parlaklığı monoton değildir: ortada (camgöbeği/sarı) parlar, iki uçta koyulaşır. Bu, olmayan yerlerde keskin "kenarlar" uydurur ve gerçek gradyanları gizler.',"parula (MATLAB) ve viridis (Python/Octave) parlaklığı doğrusal artacak biçimde tasarlanmıştır; gri basıldığında da renk körü bir okuyucu için de sıralama korunur.","Gri dönüşüm testi ücretsiz bir denetimdir: paleti gri tonlamaya çevirip aynı haritayı çizin. Gri sürüm anlaşılır kalıyorsa palet güvenlidir.","caxis (yeni sürümlerde clim) ile renk sınırlarını sabitlemek karşılaştırmalı haritaların ön koşuludur; otomatik ölçeklemede iki gün arasındaki fark tamamen kaybolur.","İki uçlu (diverging) alanlarda — anomali, vortisite, adveksiyon — sıfırı beyaz olan bir palet gerekir; tek yönlü alanlarda (hız, yağış) tek yönlü palet. Palet seçimi verinin türüne bağlıdır."],output:"İki pencere. Birincisinde yan yana iki 500 hPa haritası: soldaki yumuşak ve okunabilir, sağdaki (jet) sırt-çukur sınırlarında sahte parlak bantlar gösterir. İkincisinde gri tonlamaya çevrilmiş iki sürüm: parula grisinde alanın yapısı hâlâ okunur, jet grisinde orta değerler ile uç değerler aynı tonu alır. Diske gh500_palet.png yazılır.",pitfalls:["caxis R2022a'dan itibaren clim adını aldı; eski sürümde clim yoktur, yeni sürümde caxis hâlâ çalışır ama uyarı verebilir. Taşınabilirlik için sürümü kontrol edin.","colormap'i eksen belirtmeden çağırmak (colormap(jet)) figürün TAMAMINI değiştirir; iki panelli karşılaştırma böyle çöker.","exportgraphics R2020a+ gerektirir. Öncesinde print(gcf, '-dpng', '-r200', ...) kullanın; saveas çözünürlüğü kontrol etmez.",'Kontur seviyelerini otomatik bırakmak (contourf(...,20)) her haritada farklı aralık üretir; zaman serisi animasyonlarında alan "titrer". Seviyeleri her zaman elle verin.'],run:{level:"500",script:`set lev 500
set gxout shaded+contour
set cmap viridis
set cint 60
set cbar on
set title 500 hPa gh - algisal esit adimli palet (viridis)
d gh`,bridge:"MATLAB betiği aynı veriyi iki paletle yan yana çizer. Tarayıcıda MATLAB yok; sağdaki harita gerçek 500 hPa alanını YolHava mini motorunun viridis paletiyle çizmesidir. Paleti `set cmap` satırında magma / rdbu / nws / gray olarak değiştirip aynı veriye bakın: kodun kanıtlamaya çalıştığı şeyi canlı görürsünüz — alan değişmedi, algı değişti."},level:1,tags:["contourf","renk paleti","viridis","jet","görselleştirme"]},{id:"matlab-quiver",title:"quiver ve streamslice — rüzgâr alanını okunur çizmek",lang:"matlab",goal:"850 hPa rüzgârını hız (renk) + vektör (ok) + akım çizgisi olarak üst üste çizmek; ok yoğunluğunu ve ölçeğini haritayı boğmayacak biçimde ayarlamak.",data:"era5_pl_20260115.nc içindeki u, v (m/s) değişkenleri, 850 hPa dilimi.",code:`f = 'era5_pl_20260115.nc';
lon = double(ncread(f, 'longitude'));  lat = double(ncread(f, 'latitude'));
lev = ncread(f, 'level');  k = find(lev == 850, 1);

u = double(squeeze(ncread(f, 'u', [1 1 k 1], [Inf Inf 1 1]))).';   % lat x lon
v = double(squeeze(ncread(f, 'v', [1 1 k 1], [Inf Inf 1 1]))).';
if lat(1) > lat(end)                 % streamslice artan eksen ister
    lat = flipud(lat);  u = flipud(u);  v = flipud(v);
end

[LON, LAT] = meshgrid(lon, lat);
ws = hypot(u, v);

figure('Color', 'w', 'Position', [80 80 980 640]);
contourf(LON, LAT, ws, 0:2:40, 'LineColor', 'none'); hold on;
colormap(parula(64)); caxis([0 40]); colorbar;

s = 4;                                % her 4 noktada bir ok
quiver(LON(1:s:end, 1:s:end), LAT(1:s:end, 1:s:end), ...
       u(1:s:end, 1:s:end),   v(1:s:end, 1:s:end), ...
       1.6, 'Color', [0 0 0], 'LineWidth', 0.6);

h = streamslice(LON, LAT, u, v, 2);   % akim cizgileri, yogunluk 2
set(h, 'Color', [0.25 0.25 0.25], 'LineWidth', 0.7);

title('850 hPa ruzgar - hiz (renk), vektor (ok), akim cizgisi');
xlabel('boylam'); ylabel('enlem');
axis([min(lon) max(lon) min(lat) max(lat)]);
hold off;

fprintf('maks hiz %.1f m/s, ortalama %.1f m/s\\n', max(ws(:)), mean(ws(:)));
exportgraphics(gcf, 'wind850.png', 'Resolution', 180);
save('wind850.mat', 'lon', 'lat', 'u', 'v');`,lineNotes:[{line:5,text:"squeeze tekil boyutları atar, .' transpozla diziyi lat×lon yapar: çizim işlevlerinin beklediği düzen budur."},{line:7,text:"streamslice ve quiver artan, düzgün (plaid) eksen ister. ERA5 enlemi azalan geldiği için burada çevriliyor."},{line:8,text:"Enlem çevrilirken u ve v de AYNI eksende çevrilmeli; yalnız birini çevirmek alanı sessizce bozar."},{line:12,text:"hypot(u,v) = sqrt(u²+v²) ama taşma/alt taşmaya karşı sayısal olarak daha güvenlidir."},{line:15,text:"Önce dolgulu hız alanı, sonra üstüne oklar: çizim sırası katman sırasıdır."},{line:16,text:"caxis sabitlenmezse her zaman adımında renk ölçeği kayar; animasyon yaparken bu şarttır."},{line:18,text:"Seyreltme adımı s: 0.25° ızgarada her noktaya ok çizmek haritayı siyah bir lekeye çevirir."},{line:19,text:"1:s:end dilimlemesi hem koordinat hem bileşen matrislerine AYNI biçimde uygulanmalı."},{line:21,text:"Beşinci argüman ok ölçeğidir (0 = otomatik ölçekleme kapalı). 1.6 tipik olarak okları hücre boyunun biraz üstüne taşır."},{line:23,text:"streamslice akım çizgilerini otomatik tohumlar; ikinci sayısal argüman yoğunluk çarpanıdır."},{line:24,text:"Dönen tanıtıcılar üzerinden renk/kalınlık ayarı: akım çizgileri arka planı bastırmamalı."},{line:28,text:"Eksen sınırlarını elle vermek harita kenarındaki boşluğu kaldırır."},{line:33,text:"u ve v sonraki vortisite örneğinde kullanılacağı için kaydediliyor."}],explain:["Rüzgâr vektörel bir alandır; tek bir skaler harita (hız) yönü göstermez, tek başına ok haritası da şiddeti okunur kılmaz. Doğru çözüm katmanlamaktır: renk şiddet, ok yön.","Ok yoğunluğu bir estetik tercih değil okunabilirlik eşiğidir. Kural: ekranda 30×20'den fazla ok varsa seyreltin; seyreltme adımı çözünürlükle birlikte büyümelidir.","Akım çizgisi (streamline) ile yörünge (trajectory) farklıdır: akım çizgisi TEK bir zaman anındaki alana teğettir, hava parselinin gerçek yolu değildir. Alan zamanla değişiyorsa ikisi ayrışır.",'quiver okları varsayılan olarak otomatik ölçekler; iki farklı saatin haritasını karşılaştıracaksanız ölçeği sabitlemek zorundasınız, yoksa "rüzgâr arttı" yanılsaması oluşur.',"Meteorolojik rüzgâr oku (barb) ile matematiksel ok farklı gösterimlerdir: barb şiddeti tüylerle kodlar ve kalabalıkta bile okunur, quiver ise uzunlukla kodlar.","Enlem yönünü düzeltmek bu örnekte iki yerde iş görür: hem harita düz çıkar hem de akım çizgisi algoritması doğru yönde entegre eder."],output:"850 hPa için tek bir harita: arka planda 0–40 m/s renk ölçeğinde hız, üzerinde seyreltilmiş siyah oklar, onların üzerinde gri akım çizgileri. Konsola `maks hiz 34.2 m/s, ortalama 9.8 m/s` benzeri bir satır. Diske wind850.png ve wind850.mat yazılır.",pitfalls:["u ve v'yi transpoz etmeyi unutmak: harita çizilir, hata vermez, ama oklar 90° dönmüş olur. Kontrol yöntemi: kuzey yarımkürede alçak basınç çevresinde akış saat yönünün TERSİ olmalı.","streamslice düzgün olmayan (ör. Gauss) ızgarada hata verir ya da yanlış çizer; spektral model çıktısında önce düzenli ızgaraya interpolasyon gerekir.","quiver ölçeğini 0 yapmak okları gerçek birimde çizer ve çoğu zaman ekranı taşırır; 0 yerine küçük bir sayı ile başlayıp ayarlayın.","Seyreltmeyi yalnız koordinatlara uygulayıp bileşenlere uygulamamak boyut uyuşmazlığı hatası verir — ya da daha kötüsü, MATLAB yayılım yapmadığı için hiç uyarı almadan yanlış eşleşme oluşur."],run:{level:"850",script:`set lev 850
set gxout vector
set skip 3
set arrscl 1.4
set cmap viridis
set cbar on
set title 850 hPa ruzgar vektoru (ok boyu = hiz)
d u ; v`,bridge:"MATLAB betiği hız + ok + akım çizgisini üst üste basar. Tarayıcıdaki mini motor `set gxout vector` ile aynı işin ok katmanını yapar: `d u ; v` iki bileşeni birlikte ister, `set skip 3` kodun s = 4 seyreltmesinin karşılığıdır, `set arrscl` ise quiver'ın ölçek argümanına denk düşer. Skip değerini 1 yapıp kalabalığı, 6 yapıp seyrekliği görün."},level:2,tags:["quiver","streamslice","vektör alan","rüzgâr","seyreltme"]},{id:"matlab-vorticity",title:"gradient ile bağıl ve mutlak vortisite",lang:"matlab",goal:"Küresel koordinatta metre cinsinden doğru mesafelerle ζ = ∂v/∂x − ∂u/∂y hesaplamak, Coriolis ekleyip mutlak vortisiteye geçmek ve sonlu-fark gürültüsünü yumuşatmak.",data:"Bir önceki örneğin kaydettiği wind850.mat (lon, lat, u, v — lat×lon düzeninde).",code:`load('wind850.mat');                   % lon, lat, u, v (lat x lon)
R = 6371000;  d2r = pi/180;  OM = 7.2921e-5;
[LON, LAT] = meshgrid(lon, lat);

dlon = (lon(2) - lon(1)) * d2r;        % rad
dlat = (lat(2) - lat(1)) * d2r;
dx   = R * cos(LAT * d2r) * dlon;      % metre; enlemle daralir
dy   = R * dlat;                       % metre; sabit

[dvdi, ~   ] = gradient(v);            % indis basina degisim (sutun = boylam)
[~,    dudj] = gradient(u);            % satir = enlem

zeta = dvdi ./ dx - dudj ./ dy;        % bagil vortisite (1/s)
fcor = 2 * OM * sin(LAT * d2r);
eta  = zeta + fcor;                    % mutlak vortisite

K   = ones(3) / 9;                     % 3x3 kutu suzgeci
zsm = conv2(zeta, K, 'same');          % sonlu fark gurultusunu bastir

figure('Color', 'w');
contourf(LON, LAT, zsm * 1e5, -20:2:20, 'LineColor', 'none');
cm = [linspace(0.13,1,32)' linspace(0.35,1,32)' linspace(0.72,1,32)'; ...
      linspace(1,0.80,32)' linspace(1,0.14,32)' linspace(1,0.14,32)'];
colormap(cm);  caxis([-20 20]);  colorbar;
hold on;
contour(LON, LAT, eta, [0 0], 'k', 'LineWidth', 1.2);
title('850 hPa bagil vortisite (10^{-5} s^{-1}); siyah: eta = 0');
xlabel('boylam'); ylabel('enlem'); hold off;

fprintf('zeta araligi: %.1f .. %.1f (10^-5 1/s)\\n', ...
        min(zsm(:))*1e5, max(zsm(:))*1e5);`,lineNotes:[{line:2,text:"Yerkürenin yarıçapı, derece→radyan çarpanı ve Dünya'nın açısal hızı. Sabitleri en başta tanımlamak birim hatalarını azaltır."},{line:5,text:"Izgara aralığı DERECEDEN radyana çevriliyor; trigonometrik fonksiyonlar radyan ister."},{line:7,text:"dx enlemin fonksiyonudur: kutba yaklaştıkça boylam çizgileri birbirine yaklaşır, cos(φ) çarpanı bunu yazar. Bu satırın atlanması en sık yapılan vortisite hatasıdır."},{line:8,text:"dy sabittir çünkü enlem çizgileri arasındaki mesafe her yerde aynıdır."},{line:10,text:"gradient(v) iki çıktı verir: birincisi sütun (x) yönünde, ikincisi satır (y) yönünde. Burada yalnız birincisi gerekli."},{line:11,text:"u için yalnız satır yönü (enlem) gerekli. Tilde ile istenmeyen çıktı atılır."},{line:13,text:"İndis başına türevler METREYE bölünerek fiziksel türeve çevriliyor. Bu bölme unutulursa sayı büyüklüğü tamamen yanlış olur."},{line:14,text:"Coriolis parametresi f = 2Ω sin(φ); kuzeyde pozitif, güneyde negatif, ekvatorda sıfır."},{line:15,text:"Mutlak vortisite = bağıl + gezegensel. Korunan büyüklük (potansiyel vortisitenin payı) budur."},{line:17,text:"3×3 ortalama çekirdeği: en basit alçak geçirgen süzgeç."},{line:18,text:"conv2(..., 'same') boyutu korur ama kenarları sıfırla doldurur; kenar şeridini yorumlamayın."},{line:22,text:"Elle kurulmuş iki uçlu palet: mavi → beyaz → kırmızı. Sıfır tam ortada beyaz kalır."},{line:26,text:"η = 0 konturu: mutlak vortisitenin işaret değiştirdiği yer, kuzey yarımkürede atalet (inertial) kararsızlığına işaret eder."}],explain:["Bağıl vortisite ζ = ∂v/∂x − ∂u/∂y akışın yerel dönme miktarını ölçer. Pozitif değer kuzey yarımkürede saat yönünün tersi, yani siklonik dönüştür.","Küresel koordinatta dx sabit değildir. Dereceyi doğrudan metreymiş gibi kullanmak 40° enlemde %23, 60° enlemde %50 hata demektir — ve hata enlemle sistematik olarak değiştiği için haritada sahte bir kuzey-güney eğimi yaratır.","Mutlak vortisite η = ζ + f, gezegenin kendi dönüşünü de sayar. Sıkışma/genleşme yokken korunur; bu, Rossby dalgalarının varlık nedenidir.","Sonlu fark yüksek dalga sayılarını yükseltir: türev almak gürültüyü büyütür. Hafif bir yumuşatma (burada 3×3 kutu) alanın yapısını bozmadan ızgara ölçekli gürültüyü siler.","Vortisite iki uçlu bir alandır; sıfırın beyaz olduğu ayrışık (diverging) palet kullanmak zorunludur. Tek yönlü paletle çizilen vortisite haritası yanlış okunur.","η = 0 konturu operasyonel analizde işe yarar: kuzey yarımkürede η'nın negatife düşmesi atalet kararsızlığına ve hızlı konvektif gelişime elverişli bir ortama işaret eder."],output:"Tek bir harita: mavi (antisiklonik) ve kırmızı (siklonik) bölgeler −20…+20 ×10⁻⁵ s⁻¹ ölçeğinde, çukur eksenleri boyunca uzanan pozitif şeritler belirgin. Konsolda `zeta araligi: -12.4 .. 18.7 (10^-5 1/s)` benzeri bir satır. Yumuşatma yapılmasaydı aynı harita nokta nokta benekli çıkardı.",pitfalls:["gradient çıktı sırasını karıştırmak: [FX, FY] = gradient(Z) biçiminde FX SÜTUN yönündedir. Ters kullanırsanız vortisite işareti ters döner ve tüm yorum tersine çevrilir.",'cos(LAT) çarpanını unutmak: orta enlemlerde değerler sistematik olarak küçük çıkar; hata sabit olmadığı için "kalibrasyon" ile düzeltilemez.',"Enlem azalan sıralıysa dlat negatif olur ve ∂u/∂y işareti ters döner. wind850.mat'i üreten örnekte enlem artan yapıldığı için burada sorun yok; başka veriyle çalışırken önce kontrol edin.","conv2 kenarları sıfır varsayar, bu yüzden haritanın 1 hücrelik kenar şeridi yapay olarak sıfıra çekilir. Kenarı kırpın ya da 'replicate' dolgulu bir süzgeç kullanın."],run:{level:"500",script:`set lev 500
set gxout shaded
set cmap rdbu
set cbar on
set title 500 hPa bagil vortisite (1/s), 9 noktali yumusatma
d smth9(hcurl(u,v))`,bridge:"MATLAB kodu ζ = ∂v/∂x − ∂u/∂y hesabını küresel metrikle elle kurar ve 3×3 ortalamayla yumuşatır. Mini motorda aynı iki adım hazır: `hcurl(u,v)` küresel metriği (cos φ çarpanı dahil) içeren rotasyonel türevi, `smth9()` ise dokuz noktalı yumuşatmayı uygular. Sağdaki harita gerçek 500 hPa alanının vortisitesidir; kodu kendi makinenizde çalıştırdığınızda aynı desen, aynı işaret kuralıyla çıkar."},level:3,tags:["vortisite","gradient","sonlu fark","Coriolis","yumuşatma"]},{id:"matlab-filter",title:"Zaman serisi süzme ve güç spektrumu — günlük döngüyü ayırmak",lang:"matlab",goal:"Saatlik istasyon sıcaklığından günlük döngüyü ve sinoptik değişimi ayırmak; hareketli ortalama ile sıfır faz kaymalı süzgeci karşılaştırmak ve baskın periyotları spektrumda göstermek.",data:"istasyon_17060.csv — sütunlar: time (tarih-saat), temp (°C). Saatlik, en az birkaç aylık kesintisiz kayıt.",code:`T = readtable('istasyon_17060.csv');      % sutunlar: time (datetime), temp
t = T.time;  x = T.temp;
x = fillmissing(x, 'linear');             % kisa bosluklari kapat
fs = 1/3600;                              % saatlik veri -> Hz

% 1) 24 saatlik hareketli ortalama: gunluk dongu sonumlenir
x24 = movmean(x, 24, 'Endpoints', 'shrink');

% 2) Sifir faz kaymali alcak gecirgen (Signal Processing Toolbox)
fc = 1 / (72*3600);                       % 72 saatlik kesim
[b, a] = butter(4, fc/(fs/2), 'low');
xlp = filtfilt(b, a, x);                  % ileri + geri: faz kaymasi yok

% 3) Guc spektrumu: egilimi at, Hann penceresi uygula, FFT al
N  = 2^floor(log2(numel(x)));
w  = 0.5 - 0.5*cos(2*pi*(0:N-1)'/(N-1));  % Hann penceresi (elle)
xw = detrend(x(1:N)) .* w;
P  = abs(fft(xw)).^2 / (fs * sum(w.^2));  % guc yogunlugu
fr = (0:N/2-1)' * fs / N;
per = 1 ./ fr(2:end) / 3600;              % periyot (saat)

figure('Color', 'w');
subplot(2,1,1);
plot(t, x, 'Color', [.75 .75 .75]); hold on;
plot(t, x24, 'b', 'LineWidth', 1.2);
plot(t, xlp, 'r', 'LineWidth', 1.2);
legend('ham', '24 sa hareketli ort.', '72 sa alcak gecirgen', 'Location', 'best');
ylabel('T (\\circC)'); grid on; hold off;

subplot(2,1,2);
loglog(per, P(2:N/2), 'k'); hold on;
xline(24, 'r--', '24 sa'); xline(12, 'b--', '12 sa');
xlabel('periyot (saat)'); ylabel('guc yogunlugu'); grid on; hold off;

fprintf('gunluk genlik: %.2f C | 72 sa suzulmus degisim: %.2f C\\n', ...
        std(x - x24), std(xlp));`,lineNotes:[{line:3,text:"Kısa boşluklar doğrusal doldurulur. FFT NaN kabul etmez; boşluk bırakırsanız tüm spektrum NaN olur."},{line:4,text:"Örnekleme frekansı: saatte bir ölçüm = 1/3600 Hz. Spektrumun eksenleri tamamen bu sayıya bağlıdır."},{line:7,text:"movmean 24 örneklik kayan pencere: tam bir günü ortaladığı için günlük döngüyü büyük ölçüde siler."},{line:7,text:"'Endpoints','shrink' uçlarda pencereyi kısaltır; 'fill' kullanılırsa uçlar NaN olur."},{line:11,text:"butter normalize kesim frekansı ister: fc / (fs/2), yani Nyquist'e oranlanmış değer. 0–1 aralığında olmalı."},{line:12,text:"filtfilt süzgeci ileri ve geri uygular: faz kayması sıfırlanır ama etkin mertebe iki katına çıkar."},{line:15,text:"FFT için uzunluğu 2'nin kuvvetine kırpmak hız kazandırır; kayıp veri uçtan atılır."},{line:16,text:"Hann penceresi elle kuruluyor — böylece Signal Processing Toolbox olmayan kurulumlarda da çalışır."},{line:17,text:"detrend doğrusal eğilimi çıkarır; yoksa spektrumun düşük frekans ucu sahte güçle dolar."},{line:18,text:"Pencere enerjisine (sum(w²)) bölmek güç yoğunluğunu birim başına normalize eder."},{line:20,text:'Frekans yerine PERİYOT ekseni: meteorolojide "24 saatlik tepe" demek "1.157×10⁻⁵ Hz" demekten okunaklıdır.'},{line:32,text:"24 ve 12 saatlik çizgiler: günlük döngü ve onun ilk harmoniği. Gerçek veride ikisi de belirgindir."},{line:35,text:"İki standart sapma: günlük dalgalanmanın genliği ile sinoptik ölçekli değişimin genliği."}],explain:["Bir istasyon sıcaklığı en az üç ölçeği üst üste taşır: günlük döngü (24 sa), sinoptik geçişler (3–7 gün) ve mevsimsel eğilim. Süzme, bu ölçekleri ayırmanın aracıdır.","Hareketli ortalama en basit alçak geçirgen süzgeçtir ama frekans yanıtı kötüdür: yan loblar bazı periyotları ters işaretle geçirir. Buna rağmen 24 örneklik pencere günlük döngüyü sildiği için pratikte çok kullanılır.","filtfilt'in üstünlüğü faz kaymasının sıfır olmasıdır: süzülmüş seri ham seriyle AYNI zamanda tepe yapar. Tek yönlü filtre kullanırsanız süzülmüş eğri gecikmeli çıkar ve olay zamanlaması yanlış okunur.","Spektrum, verinin hangi periyotlarda enerji taşıdığını gösterir. Sıcaklıkta 24 ve 12 saatlik tepeler neredeyse her zaman vardır; 12 saatlik tepe günlük döngünün simetrik olmamasından doğar.","Pencereleme (Hann) sızıntıyı azaltır: penceresiz FFT keskin tepeleri komşu frekanslara yayar ve zayıf sinyalleri gizler.","Sonuçtaki iki standart sapma pratik bir özet verir: günlük genlik büyükse yer karasal ve açık havalı, sinoptik değişim büyükse bölge cephe geçişlerine açık demektir."],output:"İki panelli bir figür. Üst panelde gri ham seri, üzerinde mavi 24 saatlik ortalama ve kırmızı 72 saatlik süzülmüş eğri — ikisi de günlük dişleri temizler, kırmızı olan daha yumuşaktır. Alt panelde log-log spektrum: 24 saatte belirgin bir tepe, 12 saatte daha küçük ikinci tepe ve uzun periyotlara doğru artan bir taban. Konsolda iki genlik değeri.",pitfalls:["butter ve filtfilt Signal Processing Toolbox gerektirir; Octave'da `pkg load signal` gerekir. Toolbox yoksa yalnız movmean bölümü çalışır.",'Normalize kesim frekansını yanlış hesaplamak (fs/2 ile bölmeyi unutmak) "Cutoff frequency must be within (0,1)" hatası verir ya da tamamen yanlış bir süzgeç kurar.',"filtfilt seri uzunluğunun süzgeç mertebesinin en az 3 katı olmasını ister; kısa serilerde hata verir. Mertebeyi düşürün ya da daha uzun veri kullanın.",`Veride uzun boşluklar varsa fillmissing bunları "uydurur" ve spektrumda sahte düşük frekans gücü doğar. Boşluk oranını önce ölçün; %5'i geçiyorsa aralığı serinin dışında bırakın.`],level:3,tags:["zaman serisi","süzgeç","filtfilt","FFT","spektrum"]}]},{id:"r",title:"R — istatistik, iklim serisi ve yayın grafiği",emoji:"📈",intro:"R, meteorolojide model çıktısı çizmekten çok GÖZLEMİ anlamak için kullanılır: uzun istasyon serileri, eğilim testleri, ekstrem değer analizi, doğrulama skorları. ncdf4 ve terra ile ızgara verisine de erişir; ggplot2 ise yayın kalitesinde grafiği bir dilbilgisi hâline getirir. Bu grupta veri okumadan eğilim kestirimine ve dönüş seviyesi hesabına uzanan tipik bir iklim analizi yapıyoruz.",examples:[{id:"r-ncdf4",title:"ncdf4 ile NetCDF okuma ve hızlı bakış haritası",lang:"r",goal:"R içinden bir ERA5 dosyasını açıp 500 hPa yükseklik dilimini almak, enlem yönünü düzeltmek ve temel grafik sistemiyle hızlı bir kontrol haritası çizmek.",data:"era5_pl_20260115.nc — z (m²/s²), boyutlar longitude, latitude, level, time.",code:`library(ncdf4)

nc <- nc_open("era5_pl_20260115.nc")
cat("degiskenler:", paste(names(nc$var), collapse = ", "), "\\n")
cat("boyutlar   :", paste(names(nc$dim), collapse = ", "), "\\n")

lon <- ncvar_get(nc, "longitude")
lat <- ncvar_get(nc, "latitude")
lev <- ncvar_get(nc, "level")
k   <- which.min(abs(lev - 500))

# z: lon x lat x level x time -> tek dilim; -1 = "bu boyutun tamami"
z  <- ncvar_get(nc, "z", start = c(1, 1, k, 1), count = c(-1, -1, 1, 1))
gh <- z / 9.80665                       # m2/s2 -> gpm

tunit <- ncatt_get(nc, "time", "units")$value
tval  <- ncvar_get(nc, "time")
zaman <- as.POSIXct(tval * 3600, origin = "1900-01-01", tz = "UTC")
nc_close(nc)                            # DOSYAYI KAPAT: kilit kalmasin

cat(sprintf("izgara %d x %d | %s | %.0f-%.0f gpm\\n",
            length(lon), length(lat), format(zaman[1]), min(gh), max(gh)))
cat("zaman birimi:", tunit, "\\n")

# R'de enlem cogunlukla azalan gelir; image() artan eksen ister
if (lat[1] > lat[length(lat)]) {
  lat <- rev(lat)
  gh  <- gh[, ncol(gh):1]
}

png("gh500_R.png", width = 1000, height = 720, res = 120)
image(lon, lat, gh, col = hcl.colors(32, "Viridis"),
      xlab = "boylam", ylab = "enlem", main = "500 hPa yukseklik (gpm)")
contour(lon, lat, gh, levels = seq(4800, 6000, 60), add = TRUE, col = "grey20")
dev.off()

saveRDS(list(lon = lon, lat = lat, gh = gh, zaman = zaman[1]), "gh500.rds")`,lineNotes:[{line:1,text:"ncdf4 paketi NetCDF4/HDF5 destekli arayüzdür. Eski ncdf paketiyle karıştırmayın; o artık bakımsızdır."},{line:3,text:"nc_open bir bağlantı nesnesi döndürür; içinde tüm üstveri hazırdır."},{line:4,text:"nc$var değişkenlerin listesi, nc$dim boyutların listesi. İlk iş her zaman bunları basmaktır."},{line:10,text:"which.min(abs(lev - 500)): tam eşleşme aramak yerine EN YAKIN seviyeyi bulur; kayan nokta karşılaştırması güvenilmezdir."},{line:13,text:'start/count ile dilim: count içinde −1, "bu boyutun tamamını al" demektir. ncdf4 tekil boyutları otomatik düşürür.'},{line:14,text:"Jeopotansiyeli jeopotansiyel metreye çevirme. Sayılar 50 000 mertebesindeyse bu satır atlanmış demektir."},{line:16,text:"Zaman biriminin metnini okuyup basıyoruz: dönem (origin) her dosyada aynı değildir."},{line:18,text:'ERA5 saat cinsinden sayar; 3600 ile çarpıp saniyeye çevirip POSIXct kuruyoruz. tz = "UTC" şart, yoksa yerel saate kayar.'},{line:19,text:'nc_close unutulursa dosya tanıtıcısı açık kalır; döngü içinde yüzlerce dosya açan betikler "too many open files" ile durur.'},{line:26,text:"Enlem yönü denetimi. R'nin image() işlevi eksenin artan olmasını bekler."},{line:28,text:"gh lon×lat düzeninde olduğu için sütunlar (2. boyut) ters çevriliyor."},{line:32,text:"hcl.colors base R'de gelir (3.6+); ek paket kurmadan algısal olarak düzgün palet verir."},{line:34,text:"contour(..., add = TRUE) aynı eksene ikinci katmanı basar: dolgu üstüne kontur çizgisi."},{line:37,text:"saveRDS tek bir R nesnesini diske yazar; sonraki betikler readRDS ile tam olarak aynı yapıyı geri alır."}],explain:["ncdf4 arayüzü üç adımdır: nc_open → ncvar_get → nc_close. Arada ncatt_get ile öznitelik (birim, dönem, _FillValue) okunur.","ncvar_get tekil boyutları otomatik düşürür (drop). Bu kolaylık bazen sorun olur: tek zaman adımlı bir dosyada beklediğiniz 3B dizi 2B gelir; boyutu her zaman dim() ile doğrulayın.",`Zaman ekseni NetCDF'te "birim + dönem" olarak saklanır. Dönemi dosyadan okumak yerine varsaymak, tarihleri yıllarca kaydıran klasik bir hatadır.`,"R'nin temel image()/contour() işlevleri yayın için değil KONTROL için uygundur: veriyi okur okumaz bir kez çizip gözle doğrulamak, sonraki tüm analizi güvenceye alır.","Enlem yönünü tek bir yerde düzeltmek, sonraki her adımda (türev, ortalama, çizim) tutarlılık sağlar. Düzeltmeyi çizim katmanına bırakırsanız hesaplar sessizce ters kalır.","saveRDS ile ara sonucu saklamak büyük NetCDF dosyalarını tekrar tekrar okumayı önler; iklim analizinde zamanın çoğu G/Ç'de geçer."],output:"Konsolda değişken/boyut listesi, `izgara 321 x 141 | 2026-01-15 | 4870-5910 gpm` benzeri özet ve zaman birimi satırı. Diske gh500_R.png (viridis dolgu + gri kontur) ve gh500.rds yazılır.",pitfalls:['origin = "1900-01-01" elle yazıldı. Başka bir dosyada dönem 1970 ya da 1800 olabilir; tunit değişkenini basıp doğrulamadan tarihe güvenmeyin.',"ncvar_get varsayılan olarak tüm değişkeni okur. Büyük dosyada start/count vermeden çağırmak R oturumunu bellek yetersizliğiyle düşürür.","Enlem çevirmede gh[, ncol(gh):1] yerine gh[ncol(gh):1, ] yazmak boylamı çevirir ve harita doğu-batı ters çıkar; boyut sırasını dim(gh) ile teyit edin.","nc_close çağrılmadan betik hata verirse dosya açık kalır. Üretim betiklerinde on.exit(nc_close(nc)) kullanmak güvenlidir."],run:{level:"700",script:`set lev 700
set gxout shaded
set cmap blues
set cbar on
set title 700 hPa bagil nem (%)
d rh`,bridge:`R betiği bir NetCDF dilimini okuyup kontrol haritası basar. Tarayıcıda R yorumlayıcısı yok; sağdaki harita aynı "oku ve hemen bak" adımını YolHava mini motoruyla yapar — bu kez 700 hPa bağıl nem alanında. Kodda ncvar_get ile aldığınız dizi tam olarak böyle bir alandır: 700 hPa'da nemin yüksek olduğu bölgeler orta seviye bulutluluğun adresidir.`},level:1,tags:["ncdf4","NetCDF","zaman ekseni","kontrol haritası","R"]},{id:"r-timeseries",title:"İstasyon zaman serisi — günlük özet, aylık ortalama ve eğilim",lang:"r",goal:"Saatlik istasyon kaydından güvenilir günlük ve aylık değerler üretmek, eksik veriyi elemek ve doğrusal regresyonla sıcaklık eğilimini anlamlılığıyla birlikte kestirmek.",data:"istasyon_17060.csv — sütunlar: time (ISO tarih-saat), temp (°C), rh (%), ws (m/s), rain (mm). Saatlik, çok yıllık.",code:`library(dplyr)
library(lubridate)

obs <- read.csv("istasyon_17060.csv", stringsAsFactors = FALSE)
obs$time <- ymd_hms(obs$time, tz = "UTC")
stopifnot(!any(is.na(obs$time)))          # tarih ayrisimi bozuksa hemen dur

gunluk <- obs %>%
  mutate(gun = as.Date(time)) %>%
  group_by(gun) %>%
  summarise(tmax = max(temp, na.rm = TRUE),
            tmin = min(temp, na.rm = TRUE),
            tort = mean(temp, na.rm = TRUE),
            rr   = sum(rain, na.rm = TRUE),
            n    = sum(!is.na(temp)),
            .groups = "drop") %>%
  filter(n >= 20)                         # 24 saatin en az 20'si dolu olsun

aylik <- gunluk %>%
  mutate(ay = floor_date(gun, "month")) %>%
  group_by(ay) %>%
  summarise(tort = mean(tort), tmax = mean(tmax),
            gun_sayisi = n(), .groups = "drop") %>%
  filter(gun_sayisi >= 25)

# Dogrusal egilim: as.numeric(Date) = 1970'ten beri GUN sayisi
fit  <- lm(tort ~ as.numeric(ay), data = aylik)
egim <- coef(fit)[2] * 365.25             # C / yil
pdeg <- summary(fit)$coefficients[2, 4]
cat(sprintf("egilim %+.3f C/yil (p = %.4f, n = %d ay)\\n",
            egim, pdeg, nrow(aylik)))

# Mevsim dongusunu cikar: her ay kendi normaline gore
norm <- aylik %>% mutate(m = month(ay)) %>% group_by(m) %>%
  summarise(normal = mean(tort), .groups = "drop")
anom <- aylik %>% mutate(m = month(ay)) %>% left_join(norm, by = "m") %>%
  mutate(anomali = tort - normal)

cat("en sicak 3 ay (anomaliye gore):\\n")
print(anom %>% arrange(desc(anomali)) %>% select(ay, tort, anomali) %>% head(3))
write.csv(gunluk, "gunluk_17060.csv", row.names = FALSE)`,lineNotes:[{line:5,text:`ymd_hms tarih metnini POSIXct'e çevirir. tz = "UTC" verilmezse R yerel saat dilimini varsayar ve yaz saati geçişlerinde tekrar eden saatler doğar.`},{line:6,text:"stopifnot ile erken durma: bir tek NA tarih bile tüm gruplamayı bozar, sessizce devam etmek yerine hemen hata vermek doğrudur."},{line:9,text:"as.Date(time) saati atar, günü bırakır. Bu, UTC gününe göre gruplamadır — yerel gün isteniyorsa önce saat dilimi çevrilmeli."},{line:11,text:"na.rm = TRUE eksikleri atlar, ama kaç tanesinin atlandığını da saymak gerekir; bu yüzden n sütunu var."},{line:15,text:"n: o gün geçerli kaç saatlik ölçüm olduğu. Kalite denetiminin en basit ve en etkili biçimi."},{line:17,text:'20 saatten az veri olan günü atıyoruz. Aksi halde 3 ölçümle hesaplanan "günlük ortalama" seriye gürültü sokar.'},{line:20,text:'floor_date(gun, "month") her günü ayın ilk gününe yuvarlar; aylık gruplama anahtarı budur.'},{line:23,text:"n() dplyr'ın satır sayacıdır; gunluk içindeki n sütunuyla karışmaz çünkü fonksiyon olarak çağrılıyor."},{line:24,text:"Ayın en az 25 günü varsa aylık ortalamaya güveniyoruz."},{line:27,text:"lm ile en küçük kareler regresyonu. Bağımsız değişken tarih olduğu için sayıya çevriliyor: birim GÜN."},{line:28,text:"Eğim gün başına °C verir; 365.25 ile çarpınca yıl başına dönüşür."},{line:29,text:"summary(fit)$coefficients[2, 4]: ikinci katsayının (eğim) p değeri. Eğimi p değeri olmadan raporlamak yanıltıcıdır."},{line:34,text:"Her takvim ayının kendi ortalaması: mevsim döngüsünün tanımı."},{line:36,text:"left_join ile normal değer her satıra eklenip fark alınıyor; anomali serisi mevsimden arındırılmıştır."}],explain:["Ham saatlik veriden doğrudan aylık ortalama almak yanlıştır: eksik saatler gün içinde rastgele dağılmaz (geceleri arıza daha sık) ve ortalamayı sistematik olarak kaydırır. Doğru yol iki aşamalıdır — önce güvenilir günlük değer, sonra aylık.","Kalite eşiği (günde ≥ 20 saat, ayda ≥ 25 gün) keyfi değil, WMO uygulamalarının basitleştirilmiş bir yansımasıdır. Eşiği yazmak, onu belgelemek demektir.",'Doğrusal eğilim yalnız değeriyle değil belirsizliğiyle anlamlıdır. p değeri yüksekse "eğilim yok" demek de yanlıştır; doğru ifade "bu seri bu uzunlukta eğilimi ayırt edemiyor"dur.',"Mevsim döngüsünü çıkarmak (anomali) seriyi karşılaştırılabilir kılar: Ocak ile Temmuz aynı eksende anlamlı biçimde yan yana konabilir.",'dplyr boru hattı (%>%) her adımı okunur bir cümleye çevirir: "günlere böl, özetle, eksikleri at". Ara değişken üretmeden zincir kurmak hata yüzeyini küçültür.',"Çıktının CSV'ye yazılması sonraki iki örneğin (ggplot ve ekstrem analizi) girdisidir; analiz zincirini dosyalarla bağlamak yeniden üretilebilirliği garanti eder."],output:"`egilim +0.042 C/yil (p = 0.0013, n = 372 ay)` biçiminde tek satır ve ardından en sıcak üç ayın tablosu (ay, ortalama, anomali). Çalışma dizinine gunluk_17060.csv yazılır: gun, tmax, tmin, tort, rr, n sütunlarıyla.",pitfalls:["tz belirtmemek: R varsayılan olarak yerel saat kullanır. Türkiye'de eski kayıtlarda yaz saati geçişi olduğu için aynı yerel saat iki kez görünür ve günlük ortalama bozulur.","max(temp, na.rm = TRUE) bir günün TAMAMI eksikse -Inf döndürür ve uyarı basar. n >= 20 filtresi bu satırları attığı için sorun çıkmaz; filtreyi kaldırırsanız çıkar.",'as.numeric(ay) tarihin GÜN sayısını verir. Yanlışlıkla POSIXct kullanırsanız birim SANİYE olur ve eğim 86400 kat küçülür — sayı "0.000" göründüğü için hata fark edilmez.',"Doğrusal regresyon ardışık ayların bağımsız olduğunu varsayar; iklim serilerinde kalıcılık (otokorelasyon) vardır ve p değerini olduğundan küçük gösterir. Kesin sonuç için Mann-Kendall ya da etkin örneklem düzeltmesi gerekir."],run:{level:"surface",script:`set lev surface
set gxout shaded+contour
set cmap thermal
set cint 2
set cbar on
set title Yuzey sicakligi (C) - istasyonun icinde bulundugu alan
d t`,bridge:"R betiği TEK bir istasyonun zaman eksenindeki davranışını özetler; tarayıcıdaki harita ise aynı büyüklüğün UZAY eksenindeki anlık görüntüsüdür. İkisi birbirinin tamamlayıcısıdır: istasyon serisi bir noktanın tarihini, harita bir anın coğrafyasını verir. Kodun ürettiği günlük ortalamalar, bu haritadaki tek bir hücrenin 24 saatlik özetidir."},level:2,tags:["zaman serisi","dplyr","eğilim","lm","kalite denetimi"]},{id:"r-ggplot",title:"ggplot2 — iklim bandı üstünde güncel yıl",lang:"r",goal:"Gunluk sıcaklık serisini iklim normali ve %10–%90 bandıyla birlikte, yayına hazır bir grafikte göstermek; aynı veriden ikinci bir dağılım grafiği (aylık kutu) üretmek.",data:"gunluk_17060.csv — bir önceki örneğin çıktısı: gun, tmax, tmin, tort, rr, n.",code:`library(ggplot2)
library(dplyr)

gunluk <- read.csv("gunluk_17060.csv")
gunluk$gun <- as.Date(gunluk$gun)
gunluk$doy <- as.integer(format(gunluk$gun, "%j"))

iklim <- gunluk %>%
  filter(gun < as.Date("2021-01-01")) %>%        # 1991-2020 referans donem
  group_by(doy) %>%
  summarise(normal = mean(tort),
            p10 = quantile(tort, 0.10),
            p90 = quantile(tort, 0.90), .groups = "drop")

son <- filter(gunluk, gun >= as.Date("2026-01-01"))

p <- ggplot() +
  geom_ribbon(data = iklim, aes(doy, ymin = p10, ymax = p90),
              fill = "grey85") +
  geom_line(data = iklim, aes(doy, normal), colour = "grey30",
            linewidth = 0.5) +
  geom_line(data = son, aes(doy, tort), colour = "firebrick",
            linewidth = 0.9) +
  scale_x_continuous(breaks = c(1, 60, 121, 182, 244, 305, 365),
                     labels = c("Oca", "Mar", "May", "Tem", "Eyl", "Kas", "Ara"),
                     expand = c(0, 0)) +
  labs(title = "Istasyon 17060 - gunluk ortalama sicaklik",
       subtitle = "gri bant: 1991-2020 %10-%90 araligi; kirmizi: 2026",
       x = NULL, y = "T (C)", caption = "veri: saatlik istasyon kaydi") +
  theme_minimal(base_size = 12) +
  theme(panel.grid.minor = element_blank(),
        plot.title = element_text(face = "bold"))

ggsave("t_2026.png", p, width = 9, height = 4.5, dpi = 300)

# Ikinci grafik: aylik kutu grafigi - ortalamayi degil DAGILIMI goster
q <- ggplot(gunluk, aes(x = format(gun, "%m"), y = tmax)) +
  geom_boxplot(outlier.size = 0.6, fill = "steelblue", alpha = 0.5) +
  labs(x = "ay", y = "gunluk maksimum (C)",
       title = "Aylik maksimum sicaklik dagilimi") +
  theme_minimal(base_size = 12)
ggsave("tmax_kutu.png", q, width = 8, height = 4, dpi = 300)`,lineNotes:[{line:6,text:'format(gun, "%j") yılın kaçıncı günü olduğunu verir. Farklı yılları aynı eksende üst üste bindirmenin anahtarı budur.'},{line:9,text:'Referans dönem açıkça filtreleniyor. "İklim normali" ifadesi hangi dönemi kapsadığı yazılmadan anlamsızdır.'},{line:11,text:"Her takvim günü için ortalama ve iki yüzdelik: bandın alt-üst sınırları."},{line:17,text:"ggplot() veri vermeden başlatılıyor; her katman kendi veri çerçevesini taşıyor. İki farklı tabloyu aynı eksende çizmenin yolu budur."},{line:18,text:"geom_ribbon alt-üst sınır arasını doldurur: belirsizlik ve değişkenlik bandı için standart geom."},{line:20,text:"Normal çizgisi bandın üstüne, güncel yıl en üste çiziliyor — katman sırası görsel hiyerarşiyi belirler."},{line:24,text:"Eksen kırılımları elle veriliyor: gün numarası yerine ay adı okunabilir."},{line:26,text:"expand = c(0, 0) eksenin iki ucundaki boşluğu kaldırır; bant kenara kadar uzanır."},{line:27,text:"labs ile başlık, alt başlık ve kaynak notu. Yayına giden her grafikte kaynak satırı olmalıdır."},{line:30,text:"theme_minimal gereksiz mürekkebi azaltır; base_size tüm yazı boyutlarını tek yerden ölçekler."},{line:34,text:"ggsave boyutu İNÇ cinsinden alır ve dpi ile çarpar: 9×300 = 2700 piksel genişlik."},{line:37,text:'format(gun, "%m") ay numarasını metin olarak verir; kategorik eksen böyle kurulur ve aylar doğru sırada dizilir.'},{line:38,text:"Kutu grafiği medyanı, çeyrekleri ve aykırıları birlikte gösterir: ortalamanın gizlediği bilgiyi açar."}],explain:['ggplot2 bir "grafik dilbilgisi"dir: veri + estetik eşleme (aes) + geometri (geom) + ölçek + tema. Grafiği adım adım kurmak, hazır bir çizim işlevini ayarlamaya göre çok daha esnektir.','İklim bandı üstüne güncel yılı bindirmek, meteorolojide en sık kullanılan anlatım biçimidir: okuyucu "bu yıl olağandışı mı" sorusunun cevabını tek bakışta alır.',"Referans dönemi kod içinde filtrelemek, grafiğin alt başlığında yazmak ve aynı dosyada saklamak üçlüsü yeniden üretilebilirliğin asgari şartıdır.",'Kutu grafiği ile çizgi grafiği farklı sorulara cevap verir: çizgi "ne zaman ne oldu", kutu "değerler nasıl dağılıyor". Aynı veriden ikisini de üretmek okuyucuya iki farklı pencere açar.',"Yılın günü (doy) ekseni artı yıl bazlı renklendirme, farklı uzunluktaki yılları (artık yıl) küçük bir kaymayla üst üste bindirir; 1–365 aralığı pratikte yeterlidir.","ggsave ile boyut ve çözünürlüğü açıkça vermek, grafiğin dergi/rapor şablonuna girdiğinde yeniden ölçeklenmesini ve yazı boyutlarının bozulmasını engeller."],output:"İki PNG dosyası. t_2026.png: gri bandın (iklim %10–%90) içinden geçen koyu gri normal çizgisi ve üstünde kırmızı 2026 eğrisi; kırmızının bandın dışına taştığı günler olağandışı sıcak/soğuk dönemlerdir. tmax_kutu.png: 12 aylık kutu dizisi, yaz aylarında yüksek medyan ve dar kutu, geçiş mevsimlerinde geniş dağılım.",pitfalls:['linewidth argümanı ggplot2 3.4 ile geldi; daha eski sürümde `size` kullanılır ve linewidth "unknown aesthetic" uyarısı verir.','Farklı katmanlara farklı veri çerçevesi verirken aes() içindeki sütun adlarının her iki tabloda da bulunması gerekir; yoksa "object not found" hatası çizim anında (ggsave/print sırasında) patlar, tanımlama anında değil.',"Artık yıllarda doy 366'ya kadar gider; scale_x_continuous sınırını 365'te kesmek 29 Şubat sonrası günleri bir gün kaydırır. Uzun seride 29 Şubat'ı elemek yaygın çözümdür.","quantile(tort, 0.10) az gözlemli günlerde çok oynaktır. Referans dönemde her takvim günü için en az 20–30 yıl olmalı; yoksa bandı ±5 günlük kayan pencereyle hesaplayın."],level:2,tags:["ggplot2","iklim normali","geom_ribbon","yayın grafiği","dağılım"]},{id:"r-terra",title:"terra ile ızgara verisi: kırpma, nokta çıkarımı, yeniden ızgaralama",lang:"r",goal:"Bir raster (NetCDF/GeoTIFF/GRIB) dosyasını terra ile açıp Türkiye kutusuna kırpmak, şehir noktalarında değer okumak, çözünürlüğü değiştirmek ve zaman ortalamasını diske yazmak.",data:"gfs_tcc.nc — GFS toplam bulut oranı (%), çok zaman adımlı, 0.25°, boylam 0–360.",code:`library(terra)

r <- rast("gfs_tcc.nc")            # NetCDF/GeoTIFF/GRIB (GDAL surucusu ile)
print(r)                           # boyut, cozunurluk, CRS, katman adlari
cat("katman sayisi:", nlyr(r), "\\n")

r1 <- r[[1]]                       # ilk zaman adimi
if (xmax(r1) > 180) r1 <- rotate(r1)   # 0..360 -> -180..180

kutu <- ext(25, 45, 35, 43)        # Turkiye
rtr  <- crop(r1, kutu)

cat(sprintf("cozunurluk %.3f x %.3f derece | %d x %d hucre\\n",
            res(rtr)[1], res(rtr)[2], ncol(rtr), nrow(rtr)))
cat("alan ortalamasi:", round(global(rtr, "mean", na.rm = TRUE)[1, 1], 2), "\\n")

png("bulut.png", width = 1000, height = 700, res = 120)
plot(rtr, col = hcl.colors(32, "Blues 3", rev = TRUE),
     main = "Toplam bulut orani (%)")
dev.off()

# Yeniden izgaralama: 0.25 -> 0.50 derece (iki dogrusal)
hedef <- rast(ext(rtr), resolution = 0.5, crs = crs(rtr))
rkaba <- resample(rtr, hedef, method = "bilinear")
cat("yeni hucre sayisi:", ncell(rkaba), "\\n")

# Nokta cikarimi: sehir listesinden deger oku
sehir <- data.frame(ad  = c("Istanbul", "Ankara", "Izmir"),
                    lon = c(28.98, 32.86, 27.14),
                    lat = c(41.01, 39.93, 38.42))
pts <- vect(sehir, geom = c("lon", "lat"), crs = "EPSG:4326")
sehir$deger <- extract(rtr, pts)[, 2]
print(sehir)

# Tum katmanlarin zaman ortalamasi ve diske yazma
ortalama <- app(r, mean, na.rm = TRUE)
writeRaster(ortalama, "tcc_ortalama.tif", overwrite = TRUE)`,lineNotes:[{line:3,text:"rast() GDAL üzerinden okur: NetCDF, GeoTIFF, GRIB2 ve onlarca biçim aynı çağrıyla açılır."},{line:4,text:"print(r) en önemli teşhis satırıdır: boyut, çözünürlük, koordinat sistemi ve katman adları tek bakışta görünür."},{line:5,text:"nlyr katman (çoğunlukla zaman adımı) sayısı. NetCDF'te her zaman adımı bir katman olur."},{line:7,text:"[[1]] tek katman seçer; terra'da katman seçimi çift köşeli parantezledir."},{line:8,text:"GFS boylamı 0–360 olarak yayınlar. rotate() ekseni −180..180'e kaydırır; yapılmazsa Türkiye kutusu boş döner."},{line:10,text:"ext(xmin, xmax, ymin, ymax): sıra ÖNEMLİ, önce boylam sonra enlem."},{line:11,text:"crop yalnız kutuyu keser, yeniden örneklemez: değerler aynen korunur."},{line:15,text:"global() tüm raster üzerinde özet istatistik verir ve bir data.frame döndürür; [1,1] ile sayıyı çekiyoruz."},{line:18,text:"hcl.colors ile ters çevrilmiş mavi palet: yüksek bulut oranı koyu."},{line:23,text:"Hedef ızgara elle kuruluyor: aynı kapsam, farklı çözünürlük, aynı koordinat sistemi."},{line:24,text:'resample kaynak değerlerini hedef ızgaraya taşır. Sürekli alan için bilinear, kategorik için "near" kullanılır.'},{line:31,text:"vect() data.frame'i nokta vektörüne çevirir; crs belirtmek şart, yoksa extract koordinatları eşleştiremez."},{line:32,text:"extract ilk sütunda ID, ikinci sütunda değeri döndürür; bu yüzden [, 2]."},{line:36,text:"app() katmanlar boyunca (yani zamanda) fonksiyon uygular: burada zaman ortalaması."},{line:37,text:"writeRaster GeoTIFF yazar; overwrite = TRUE olmadan var olan dosyaya yazmayı reddeder."}],explain:["terra, R'nin raster işleme paketidir (eski raster paketinin yerini aldı) ve GDAL'ı sardığı için biçim bağımsızdır: NetCDF, GRIB, GeoTIFF aynı arayüzle işlenir.","Boylam kuralı (0–360 ya da −180..180) model çıktısıyla çalışırken ilk kontrol edilecek şeydir. GFS 0–360, ERA5 dosyaya göre değişir; rotate() bu farkı tek satırda kapatır.","crop ile resample farklıdır: crop kesip atar, resample interpolasyonla YENİDEN hesaplar. Alt küme almak istiyorsanız crop kullanın; resample gereksiz yere değerleri değiştirir.","Nokta çıkarımı (extract) doğrulama işinin temelidir: model ızgarasındaki değeri istasyon konumuna indirip gözlemle karşılaştırırsınız. Hücre merkezine en yakın değer mi yoksa iki-doğrusal ara değer mi istediğinize karar vermelisiniz.","app() ile katmanlar boyunca işlem, zaman ortalaması/toplamı/yüzdeliği almanın yoludur ve bellekte tutamayacağınız büyük dosyalarda parça parça çalışır.","Raster işlemlerinde koordinat sistemi (CRS) sessiz hataların kaynağıdır: kaynak ve hedef farklı CRS'te ise resample/extract yanlış yerden okur ama hata vermez."],output:"Konsolda raster özeti (class, dimensions, resolution, extent, crs, names), `cozunurluk 0.250 x 0.250 derece | 81 x 33 hucre`, alan ortalaması ve yeni hücre sayısı. Üç şehirlik tabloda her şehrin bulut oranı. Diske bulut.png ve tcc_ortalama.tif yazılır.",pitfalls:["rotate() atlanırsa ext(25, 45, ...) kutusu 0–360 ızgarasında yine geçerlidir ama Türkiye yerine doğru bölgeyi verir — sorun ext(-10, 5, ...) gibi negatif boylamlarda ortaya çıkar ve boş raster döner.","ext() argüman sırasını (xmin, xmax, ymin, ymax) enlem-önce yazmak hata vermez, sadece bambaşka bir kutu keser. crop sonrası print(rtr) ile kapsamı doğrulayın.",'extract() varsayılan olarak hücre değerini alır (method = "simple"); istasyon karşılaştırmasında ara değer isteniyorsa method = "bilinear" verilmelidir.',`NetCDF'te birden fazla değişken varsa rast() hangisini açtığını uyarıyla söyler; yanlış değişkeni açıp fark etmemek kolaydır. rast("dosya.nc", subds = "tcc") ile açıkça seçin.`],run:{level:"surface",script:`set lev surface
set gxout shaded
set cmap gray
set cbar on
set title Toplam bulut orani (%)
d cld`,bridge:"R betiği bulut oranı rasterini kırpar, çizer ve şehir noktalarında değer okur. Tarayıcıda terra/GDAL yok; sağdaki harita aynı alanı (toplam bulut oranı) Open-Meteo'dan canlı alıp mini motorun gri ölçekte çizmesidir. Kodun extract() ile tek tek okuduğu şehir değerleri, bu haritada o koordinatlardaki hücrenin gri tonudur."},level:2,tags:["terra","raster","kırpma","resample","nokta çıkarımı"]},{id:"r-extremes",title:"Ekstrem analizi — yüzdelikler, eşik aşımı ve Gumbel dönüş seviyesi",lang:"r",goal:"Günlük yağış serisinden ampirik yüzdelikleri ve eşik aşımı istatistiğini çıkarmak, yıllık maksimumlara Gumbel dağılımı uydurup 2–100 yıllık dönüş seviyelerini hesaplamak ve gözlemle karşılaştırmak.",data:"gunluk_17060.csv — gun, tmax, tmin, tort, rr (mm), n. En az 25–30 yıllık kayıt gerekir.",code:`library(dplyr)

obs <- read.csv("gunluk_17060.csv")
obs$gun <- as.Date(obs$gun)
obs <- filter(obs, !is.na(rr))
yil_sayisi <- length(unique(format(obs$gun, "%Y")))

# 1) Ampirik yuzdelikler - hicbir dagilim varsayimi yok
q <- quantile(obs$rr, c(0.90, 0.95, 0.99, 0.999))
print(round(q, 1))

# 2) Esik asimi (POT): yagisli gunlerin %99'u esik alinir
esik <- as.numeric(quantile(obs$rr[obs$rr > 0], 0.99))
pot  <- filter(obs, rr > esik)
cat(sprintf("esik %.1f mm | %d asim | yilda ~%.1f gun | ort. fazlalik %.1f mm\\n",
            esik, nrow(pot), nrow(pot) / yil_sayisi, mean(pot$rr - esik)))

# 3) Blok maksimum + Gumbel (moment kestirimi)
bm <- obs %>% mutate(y = format(gun, "%Y")) %>%
  group_by(y) %>% summarise(mx = max(rr), .groups = "drop")

s    <- sd(bm$mx);  m <- mean(bm$mx)
beta <- s * sqrt(6) / pi                  # olcek parametresi
mu   <- m - 0.5772157 * beta              # konum parametresi

Tr  <- c(2, 5, 10, 25, 50, 100)
lev <- mu - beta * log(-log(1 - 1 / Tr))  # Gumbel donus seviyesi
print(data.frame(donus_yili = Tr, mm = round(lev, 1)))

# 4) Gozlemle karsilastir: Gringorten konumlandirmasi
srt <- sort(bm$mx, decreasing = TRUE)     # en buyukten kucuge
i   <- seq_along(srt)                     # 1 = en buyuk
Tg  <- (length(srt) + 0.12) / (i - 0.44)  # ampirik donus periyodu

png("donus_seviyesi.png", width = 900, height = 650, res = 120)
plot(Tg, srt, log = "x", pch = 19, col = "grey30",
     xlab = "donus periyodu (yil)", ylab = "gunluk yagis (mm)",
     main = "Yillik maksimum yagis - Gumbel uyumu")
lines(Tr, lev, col = "firebrick", lwd = 2)
legend("topleft", c("gozlem", "Gumbel"), pch = c(19, NA),
       lty = c(NA, 1), col = c("grey30", "firebrick"), bty = "n")
dev.off()`,lineNotes:[{line:6,text:"Kaç yıllık veri olduğu sayılıyor: dönüş periyodu hesabının anlamı doğrudan buna bağlı."},{line:9,text:"quantile ampirik yüzdelikleri verir; hiçbir dağılım varsayımı yoktur ve veri uzunluğunun ötesine geçmez."},{line:13,text:"Eşik yalnız YAĞIŞLI günlerden hesaplanıyor. Kuru günleri katarsanız %99 yüzdelik neredeyse tüm yağış günlerini kapsar."},{line:14,text:"Eşiği aşan günler: POT (peaks over threshold) yönteminin ham malzemesi."},{line:15,text:"Aşım sıklığı ve ortalama fazlalık birlikte raporlanır; ikisi Genelleştirilmiş Pareto uyumunun temel istatistikleridir."},{line:19,text:"Blok maksimum: her yıl için tek bir değer (yıllık maksimum). Gumbel/GEV bu seri üzerine uydurulur."},{line:22,text:"Momentler yöntemi: β = s·√6/π. Basit ve gürbüz; küçük örneklemde maksimum olabilirlikten daha kararlıdır."},{line:23,text:"μ = ortalama − γβ, γ ≈ 0.5772 Euler-Mascheroni sabiti."},{line:26,text:"İstenen dönüş periyotları. Değişkeni Tr adlandırdık; R'de T adını kullanmak TRUE'yu gölgeler."},{line:27,text:'Gumbel ters dağılımı: x = μ − β·ln(−ln(1 − 1/T)). "50 yılda bir aşılan değer" tam olarak budur.'},{line:31,text:"Gözlemler büyükten küçüğe sıralanıyor: 1. sıradaki en nadir olay."},{line:33,text:"Gringorten konumlandırması ekstrem değer grafiklerinde Weibull'dan daha az yanlıdır: T = (n + 0.12)/(i − 0.44)."},{line:37,text:'log = "x": dönüş periyodu ekseni logaritmik olmalı, yoksa kısa periyotlar sıkışır.'},{line:40,text:"Gumbel eğrisi gözlem noktalarının üstüne biniyor; sapma varsa dağılım seçimi (GEV, Pareto) sorgulanmalı."}],explain:["Ekstrem analizinde iki klasik yaklaşım vardır: blok maksimum (her yıl bir değer → GEV/Gumbel) ve eşik aşımı (POT → Genelleştirilmiş Pareto). İkisi farklı veri kullanır ve farklı varsayımlara dayanır.",'"50 yıllık yağış" ifadesi o değerin 50 yılda bir kez olacağı anlamına gelmez; her yıl 1/50 olasılıkla aşılacağı anlamına gelir. Ardışık iki yılda görülmesi tamamen olağandır.',"Gumbel, GEV ailesinin şekil parametresi sıfır olan özel hâlidir. Yağışta çoğu zaman şekil parametresi pozitiftir (ağır kuyruk), bu yüzden Gumbel uzun dönüş periyotlarını KÜÇÜK tahmin etme eğilimindedir.","Ampirik yüzdelikler veri uzunluğunun ötesine geçemez: 30 yıllık seride 100 yıllık olayı yüzdelikle bulamazsınız. Dağılım uydurmanın tek gerekçesi budur — ekstrapolasyon.","Konumlandırma formülü (plotting position) gözlemleri dönüş periyodu eksenine yerleştirir. Gringorten, Gumbel dağılımı için Weibull'dan daha az yanlıdır ve grafiği yorumlamayı kolaylaştırır.","Grafik uyumun kalitesini gözle denetlemenin en hızlı yoludur: noktalar eğrinin üstünde sistematik olarak yukarı sapıyorsa kuyruk Gumbel'in varsaydığından ağırdır ve GEV'e geçmek gerekir."],output:"Yüzdelik tablosu (`90% 95% 99% 99.9%` karşılıklarında mm), ardından eşik aşımı özeti (`esik 38.4 mm | 31 asim | yilda ~1.0 gun | ort. fazlalik 14.2 mm`) ve altı satırlık dönüş seviyesi tablosu (2 yıl ≈ 45 mm, 100 yıl ≈ 110 mm mertebesinde). donus_seviyesi.png dosyasında gözlem noktaları ve kırmızı Gumbel eğrisi.",pitfalls:["R'de `T` değişken adı olarak kullanılmamalı: TRUE kısaltmasını gölgeler ve ilerideki mantıksal ifadeler sessizce bozulur. Kodda bu yüzden Tr tercih edildi.","25 yıldan kısa seriden 100 yıllık dönüş seviyesi kestirmek ağır ekstrapolasyondur; güven aralığı değerin kendisinden geniş olabilir. Bootstrap ile belirsizliği mutlaka raporlayın.","Blok maksimumda eksik yılları elemezseniz (ör. 40 günlük kaydı olan bir yıl) o yılın maksimumu düşük çıkar ve tüm uyumu aşağı çeker. n sütunuyla yıl bazlı tamlık denetimi ekleyin.","POT yönteminde ardışık günlerde gelen aynı fırtınanın iki aşımı BAĞIMSIZ sayılmamalı; deklüsterleme (ör. 3 gün ayrım) yapılmazsa aşım sayısı şişer."],run:{level:"surface",script:`set lev surface
set gxout shaded
set cmap magma
set cbar on
set title Anlik ruzgar (hamle) - m/s
d gust`,bridge:"R betiği TEK bir istasyonun uzun kaydında nadir olayları istatistikle arar. Tarayıcıdaki harita ise şu ANDAKİ hamle rüzgârı alanını gösterir: ekstrem analizinin ham malzemesi olan tekil olayların uzaydaki görüntüsü. Haritadaki en parlak bölgeler, yeterince uzun bir kayıtta dönüş seviyesi hesabına giren türden değerlerdir."},level:3,tags:["ekstrem değer","Gumbel","dönüş periyodu","POT","yüzdelik"]}]},{id:"python",title:"Python — bugünün standart analiz yığını",emoji:"🐍",intro:"Meteorolojik veri analizinde bugün en yaygın yığın Python'dur: xarray etiketli çok boyutlu diziyi, cfgrib GRIB2'yi, cartopy haritayı, MetPy termodinamiği, pandas istasyon tablosunu, dask ise belleğe sığmayan veriyi üstlenir. Bu grupta dosya açmaktan Skew-T çizmeye kadar bir çalışma gününün tipik beş adımını kuruyoruz.",examples:[{id:"python-xarray-open",title:"xarray — NetCDF/GRIB açma, etiketle seçim ve chunk ile büyük veri",lang:"python",goal:"Etiketli seçimle (sel/isel) doğru dilimi almak, cfgrib ile GRIB2'yi açmak ve belleğe sığmayan çok dosyalı seriyi chunk'larla tembel okumak.",data:"era5_pl_20260115.nc (basınç seviyesi), gfs.t00z.pgrb2.0p25.f006 (GRIB2), era5_t_*.nc (çok dosyalı seri).",code:`import xarray as xr

# 1) Tek NetCDF dosyasi
ds = xr.open_dataset("era5_pl_20260115.nc")
print(ds)                        # degiskenler, boyutlar, oznitelikler

# 2) ETIKETLE secim (indisle degil): seviye + zaman
t500 = ds["t"].sel(level=500, method="nearest").isel(time=0)
print(t500.dims, t500.shape, float(t500.min()), float(t500.max()))

# 3) Cografi kutu - ERA5'te enlem AZALAN sirali, slice de oyle olmali
tr = t500.sel(longitude=slice(25, 45), latitude=slice(43, 35))
print("Turkiye kutusu ortalamasi (C):", float(tr.mean()) - 273.15)

# 4) Zamanda yeniden orneklem: saatlikten gunluge
gunluk = ds["t"].sel(level=850).resample(time="1D").mean()
print(gunluk["time"].values[:3])

# 5) GRIB2: cfgrib motoru; karisik seviyeleri filtre ile ayir
gfs = xr.open_dataset(
    "gfs.t00z.pgrb2.0p25.f006",
    engine="cfgrib",
    backend_kwargs={"filter_by_keys": {"typeOfLevel": "isobaricInhPa",
                                       "shortName": "gh"}},
)
print(gfs["isobaricInhPa"].values)

# 6) Bellege sigmayan seri: cok dosya + chunk (dask ile TEMBEL)
big = xr.open_mfdataset("era5_t_*.nc", combine="by_coords",
                        chunks={"time": 24, "level": 1}, parallel=True)
print(big["t"].data)             # dask.array: henuz hicbir sey okunmadi

iklim = big["t"].sel(level=850).groupby("time.month").mean("time")
iklim = iklim.compute()          # ASIL hesap burada olur
print(iklim.shape)

# 7) Yaz: sikistirmayi acikca iste, yoksa dosya sisirilir
out = iklim.to_dataset(name="t")
kod = {v: {"zlib": True, "complevel": 4} for v in out.data_vars}
out.to_netcdf("t850_iklim.nc", encoding=kod)
ds.close()`,lineNotes:[{line:4,text:"open_dataset dosyayı TEMBEL açar: üstveri okunur, diziler henüz belleğe alınmaz."},{line:5,text:"Dataset'i basmak en hızlı keşif yoludur: boyut adları, koordinat değerleri ve birimler bir arada görünür."},{line:8,text:"sel etiketle seçer (500 hPa), isel indisle (ilk zaman adımı). Karıştırmak sessiz hatanın kaynağıdır."},{line:8,text:'method="nearest" kayan nokta eşleşmesi sorununu çözer: 500.0 ile 500.00001 aynı sayılır.'},{line:12,text:"slice sınırları koordinatın SIRASIYLA aynı yönde olmalı. ERA5 enlemi 90→−90 olduğu için slice(43, 35) yazılır; slice(35, 43) BOŞ döner."},{line:16,text:"resample zaman ekseninde yeniden örnekler; groupby'ın zaman için özelleşmiş hâlidir."},{line:21,text:'engine="cfgrib" GRIB2 okumayı açar (cfgrib + eccodes kurulu olmalı).'},{line:23,text:"filter_by_keys şart: bir GRIB dosyasında farklı seviye tiplerinde onlarca alan vardır ve xarray hepsini tek küpe sığdıramaz."},{line:29,text:'open_mfdataset birçok dosyayı tek mantıksal küp gibi açar; combine="by_coords" sıralamayı koordinatlardan çıkarır.'},{line:30,text:"chunks sözlüğü dask parça boyutunu belirler: her parça bir işçiye gider. Zamanda 24 (bir gün) tipik bir seçimdir."},{line:31,text:"Veri hâlâ okunmadı; .data bir dask.array gösterir. Tembellik burada görülür."},{line:34,text:".compute() hesabı tetikler. Bu satıra kadar yalnız bir işlem grafiği kuruldu."},{line:39,text:"zlib sıkıştırma açıkça isteniyor: xarray varsayılan olarak sıkıştırmadan yazar ve dosyalar 3–5 kat büyür."},{line:41,text:"close() dosya tanıtıcısını bırakır; Windows'ta açık dosya silinemediği için bu satır önemlidir."}],explain:[`xarray'in temel fikri boyutların isimli olmasıdır: axis=2 yerine dim="latitude" yazarsınız. Bu tek değişiklik meteorolojik kodda hataların büyük kısmını ortadan kaldırır.`,"sel/isel ayrımı kritik: sel koordinat DEĞERİYLE (500 hPa), isel dizi İNDİSİYLE (3. eleman) seçer. Kod okunurluğu ve taşınabilirliği için mümkün olan her yerde sel tercih edilir.","slice yönü koordinatın sırasına bağlıdır. Boş sonuç dönerse ilk bakılacak yer budur; xarray hata vermez, sadece sıfır elemanlı dizi döndürür.","GRIB2 tek bir dosyada farklı seviye tipleri, farklı adım tipleri ve farklı zaman türleri barındırabilir. cfgrib bunları tek küpe sığdıramayacağı için filtre vermek zorunludur.","dask entegrasyonu xarray'i belleğin ötesine taşır: işlemler bir grafik olarak birikir ve yalnız .compute()/.load() çağrıldığında, parçalar hâlinde, paralel yürütülür.","Chunk boyutu bir ayar meselesidir: çok küçük parçalar zamanlama maliyetini, çok büyük parçalar bellek zirvesini artırır. Başlangıç kuralı parça başına 50–200 MB'dır."],output:'Dataset özeti, `("latitude", "longitude") (141, 321) 228.4 271.0` benzeri bir satır, Türkiye kutusu ortalaması, ilk üç günlük zaman damgası, GRIB seviye listesi (`[1000 975 950 ... 100]`), bir dask.array gösterimi, `(12, 141, 321)` şekli ve diske yazılan t850_iklim.nc.',pitfalls:["slice yönünü ters yazmak boş dizi verir ve hata çıkmaz: `ds.sel(latitude=slice(35, 43))` ERA5'te 0 eleman döndürür. Sonuç boşsa önce koordinat sırasını yazdırın.",'cfgrib her açılışta yanına .idx dosyası üretir; ağ dosya sisteminde yazma izni yoksa açılış hata verir. `backend_kwargs={"indexpath": ""}` ile kapatılabilir.',"open_mfdataset'te parallel=True dask dağıtılmış istemci gerektirmez ama çok sayıda küçük dosyada üstveri okuma maliyeti baskın hâle gelir; önce dosyaları birleştirmek daha hızlıdır.","to_netcdf encoding verilmeden yazıldığında sıkıştırma OLMAZ ve çıktı girdiden büyük çıkabilir. Ayrıca _FillValue'yu elle ezmek NaN'ları sessizce gerçek sayıya çevirebilir."],run:{level:"925",script:`set lev 925
set gxout shaded+contour
set cmap thermal
set cint 2
set cbar on
set title 925 hPa sicaklik (C) - sel(level=925) ile secilen dilim
d t`,bridge:'Python kodu `ds["t"].sel(level=500)` diyerek bir dilim seçer ve şeklini basar. Tarayıcıda xarray yok; mini motorda aynı seçim `set lev 925` satırıdır ve `d t` o dilimi çizer. Seviyeyi 850 ya da 500 yapıp aynı ifadeyi tekrar çalıştırmak, kodun sel() ile yaptığı işin görsel karşılığıdır: veri aynı, seçilen katman farklı.'},level:1,tags:["xarray","sel/isel","cfgrib","dask","chunk"]},{id:"python-xarray-map",title:"matplotlib + cartopy — yayına hazır 500 hPa haritası",lang:"python",goal:"Lambert konformal izdüşümde, kıyı ve sınır çizgileriyle, dolgulu + etiketli konturlu bir 500 hPa jeopotansiyel yükseklik haritası üretmek.",data:"era5_pl_20260115.nc — z (m²/s²), 500 hPa dilimi.",code:`import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature

ds = xr.open_dataset("era5_pl_20260115.nc")
gh = ds["z"].sel(level=500).isel(time=0) / 9.80665      # m2/s2 -> gpm
lon, lat = gh["longitude"], gh["latitude"]

proj = ccrs.LambertConformal(central_longitude=30, central_latitude=40,
                             standard_parallels=(30, 50))
fig = plt.figure(figsize=(10, 7.5))
ax = plt.axes(projection=proj)
ax.set_extent([12, 48, 28, 52], crs=ccrs.PlateCarree())

lv = np.arange(4800, 6060, 60)                          # klasik 60 gpm
cf = ax.contourf(lon, lat, gh, levels=lv, cmap="viridis", extend="both",
                 transform=ccrs.PlateCarree())
cs = ax.contour(lon, lat, gh, levels=lv, colors="black", linewidths=0.6,
                transform=ccrs.PlateCarree())
ax.clabel(cs, cs.levels[::2], fmt="%d", fontsize=7, inline=True)

ax.add_feature(cfeature.COASTLINE, linewidth=0.8)
ax.add_feature(cfeature.BORDERS, linewidth=0.4, edgecolor="dimgrey")
gl = ax.gridlines(draw_labels=True, linewidth=0.3, color="grey", alpha=0.6)
gl.top_labels = False
gl.right_labels = False

cb = plt.colorbar(cf, ax=ax, orientation="vertical", shrink=0.78, pad=0.03)
cb.set_label("500 hPa jeopotansiyel yukseklik (gpm)")

zaman = str(gh["time"].values)[:16].replace("T", " ")
ax.set_title(f"500 hPa - {zaman} UTC", fontsize=13, loc="left")
plt.savefig("gh500.png", dpi=150, bbox_inches="tight")
print("kaydedildi: gh500.png")`,lineNotes:[{line:8,text:"ERA5 z değişkeni jeopotansiyeldir (m²/s²); 9.80665'e bölünce jeopotansiyel metre (gpm) olur."},{line:11,text:"Lambert konformal orta enlem haritalarının standart izdüşümüdür: açıları korur, alanı bölge ölçeğinde az bozar."},{line:12,text:"standard_parallels haritanın en az bozulduğu iki enlem; kapsanan aralığın içinde seçilir."},{line:15,text:"set_extent SINIRLARI verirken hangi koordinat sisteminde olduğunu söylemek zorundasınız: burada düz enlem-boylam."},{line:17,text:"60 gpm aralık uzlaşımsaldır; sabit tutmak farklı günleri karşılaştırılabilir kılar."},{line:18,text:'transform=PlateCarree(): "verim enlem-boylamda tanımlı" demektir. Bu argüman unutulursa cartopy veriyi izdüşüm koordinatı sanır ve harita boşalır.'},{line:18,text:'extend="both" ölçek dışına taşan değerleri renk çubuğunun uçlarındaki oklarla gösterir; aksi hâlde o bölgeler beyaz kalır.'},{line:22,text:"clabel ile kontur etiketleri; [::2] ile bir seviyenin atlanması haritayı kalabalıktan kurtarır."},{line:24,text:"Kıyı çizgisi ve ülke sınırları Natural Earth verisinden gelir; ilk çalıştırmada indirilir ve önbelleğe alınır."},{line:26,text:"gridlines enlem-boylam ağı ve etiketleri ekler; Lambert'te etiketler matplotlib 3.5+ ve cartopy 0.18+ ister."},{line:27,text:"Üst ve sağ etiketleri kapatmak başlıkla çakışmayı önler."},{line:30,text:"shrink renk çubuğunu harita yüksekliğine oranlar; pad haritayla arasındaki boşluk."},{line:33,text:"numpy datetime64 değerini metne çevirip ilk 16 karakteri (tarih + saat) alıyoruz."},{line:35,text:'bbox_inches="tight" fazla kenar boşluğunu kırpar; yayın için istenen budur.'}],explain:["Cartopy'nin çalışma mantığı iki koordinat sistemi arasındaki ayrımdır: verinin tanımlı olduğu sistem (transform) ve haritanın çizildiği sistem (projection). Bu ikisini ayırmak her çizim çağrısında transform yazmayı zorunlu kılar.","500 hPa haritası sinoptik meteorolojinin omurgasıdır: kontur sıklığı rüzgâr şiddetini, sırt-çukur dizilimi ise dalga yapısını gösterir. 60 gpm aralık bu okumayı standartlaştırır.",'Dolgu + kontur birlikte kullanılır: dolgu büyüklük hissini, kontur ise kesin değeri verir. Yalnız dolgu kullanmak haritayı "güzel ama okunamaz" yapar.',"İzdüşüm seçimi bölgeye bağlıdır: orta enlem için Lambert konformal, kutup için stereografik, tropik kuşak için Mercator ya da PlateCarree. Yanlış izdüşüm mesafeleri ve şekilleri yanıltıcı gösterir.","Renk çubuğu etiketi birim içermelidir. Birimsiz bir renk çubuğu, haritayı yalnız onu üretenin okuyabileceği bir resme çevirir.","Başlığa zaman damgasını veriden okuyarak yazmak, elle yazmaya göre çok daha güvenlidir: yanlış tarihli harita, yanlış haritadan daha zararlıdır."],output:"gh500.png: Türkiye ve çevresini kapsayan Lambert haritası. Arka planda viridis dolgu, üstünde etiketli siyah konturlar, kıyı ve sınır çizgileri, sağda gpm birimli dikey renk çubuğu, sol üstte `500 hPa - 2026-01-15 00:00 UTC` başlığı. Konsolda tek satır onay.",pitfalls:["transform argümanını unutmak en sık yapılan cartopy hatasıdır: harita çizilir ama veri görünmez ya da minik bir leke hâlinde çıkar. contourf/contour/scatter — her birine ayrı ayrı yazılmalıdır.","Boylamı 0–360 olan veriyi (GFS) doğrudan çizmek haritayı ikiye böler. Önce lon = ((lon + 180) % 360) − 180 ile kaydırıp diziyi roll etmek gerekir.","Natural Earth verisi ilk kullanımda indirilir; internetsiz makinede add_feature sessizce boş katman verir ya da zaman aşımıyla bekler. Önceden cartopy önbelleğini doldurun.","gridlines etiketleri her izdüşümde desteklenmez; eski cartopy sürümlerinde Lambert için draw_labels=True hata fırlatır. Sürüm uyumunu baştan kontrol edin."],run:{level:"500",script:`set lev 500
set gxout shaded+contour
set cmap viridis
set clevs 5100 5160 5220 5280 5340 5400 5460 5520 5580 5640
set cbar on
set title 500 hPa jeopotansiyel yukseklik (gpm)
d gh`,bridge:"Python kodu cartopy ile izdüşümlü, kıyı çizgili bir harita üretir. Tarayıcıdaki mini motor izdüşüm yapmaz — alanı doğrudan enlem-boylam ızgarasında çizer — ama ÇİZDİĞİ ALAN aynıdır: gerçek 500 hPa jeopotansiyel yükseklik. Kontur seviyeleri `set clevs` ile kodun np.arange(4800, 6060, 60) satırındaki gibi elle verildi. Yani sırt-çukur dizilimi burada ne görünüyorsa, kodu çalıştırdığınızda üretilen PNG'de de o görünür."},level:2,tags:["cartopy","matplotlib","izdüşüm","500 hPa","harita"]},{id:"python-numpy-vorticity",title:"numpy.gradient ile vortisite, ıraksama ve mutlak vortisite",lang:"python",goal:"Küresel metrikle doğru türev alarak ζ ve yatay ıraksamayı hesaplamak, Coriolis ekleyip η'yı bulmak ve sonucu koordinatlarıyla birlikte xarray Dataset olarak kaydetmek.",data:"era5_pl_20260115.nc — u, v (m/s), 500 hPa dilimi.",code:`import numpy as np
import xarray as xr

ds = xr.open_dataset("era5_pl_20260115.nc")
u = ds["u"].sel(level=500).isel(time=0)
v = ds["v"].sel(level=500).isel(time=0)

# Enlemi ARTAN sirala: tureve isaret hatasi girmesin
if u["latitude"].values[0] > u["latitude"].values[-1]:
    u = u.isel(latitude=slice(None, None, -1))
    v = v.isel(latitude=slice(None, None, -1))

lat = np.deg2rad(u["latitude"].values)      # (ny,)
lon = np.deg2rad(u["longitude"].values)     # (nx,)
R, OM = 6.371e6, 7.2921e-5

LAT = lat[:, None]                          # yayilim icin (ny, 1)
dx = R * np.cos(LAT) * np.gradient(lon)[None, :]   # (ny, nx) metre
dy = R * np.gradient(lat)[:, None]                 # (ny, 1) metre

U, V = u.values, v.values                   # eksen 0 = enlem, 1 = boylam
dudy = np.gradient(U, axis=0) / dy
dvdx = np.gradient(V, axis=1) / dx
dudx = np.gradient(U, axis=1) / dx
dvdy = np.gradient(V, axis=0) / dy

zeta = dvdx - dudy                          # bagil vortisite (1/s)
divh = dudx + dvdy                          # yatay iraksama (1/s)
f = 2 * OM * np.sin(LAT)
eta = zeta + f                              # mutlak vortisite

print("zeta : %+.1f .. %+.1f (1e-5 1/s)" % (zeta.min()*1e5, zeta.max()*1e5))
print("divh : %+.1f .. %+.1f (1e-5 1/s)" % (divh.min()*1e5, divh.max()*1e5))
print("eta<0: %d nokta (atalet kararsizligi adayi)" % int((eta < 0).sum()))

# Sonucu koordinatlariyla birlikte xarray'e geri koy
out = xr.Dataset(
    {"zeta": (("latitude", "longitude"), zeta),
     "eta":  (("latitude", "longitude"), eta),
     "divh": (("latitude", "longitude"), divh)},
    coords={"latitude": u["latitude"], "longitude": u["longitude"]},
)
for name in out.data_vars:
    out[name].attrs["units"] = "s-1"
out.to_netcdf("dyn500.nc")`,lineNotes:[{line:9,text:"Enlem yönü denetimi: ERA5 90→−90 sıralıdır. Düzeltilmezse ∂/∂y işareti ters çıkar ve vortisitenin tamamı yanlış işaretli olur."},{line:10,text:"slice(None, None, -1) tüm ekseni ters çevirir; xarray koordinatı da birlikte çevirdiği için tutarlılık korunur."},{line:13,text:"Trigonometri radyan ister; derece bırakmak cos(φ) çarpanını tamamen anlamsız yapar."},{line:17,text:"lat[:, None] sütun vektörü üretir: numpy yayılımıyla (ny,1) × (1,nx) → (ny,nx)."},{line:18,text:"dx enleme bağlıdır: R·cos(φ)·Δλ. Bu çarpan olmadan orta enlemlerde %20'den büyük sistematik hata olur."},{line:19,text:"dy sabittir: R·Δφ. Yine de (ny,1) şeklinde tutuluyor ki bölme yayılımla çalışsın."},{line:21,text:"sel/isel sonrası dizi (latitude, longitude) düzenindedir; eksen numaralarını varsaymadan önce .dims ile doğrulayın."},{line:22,text:'np.gradient merkezi farkı kullanır (uçlarda tek yanlı). Aralık argümanı verilmediği için sonuç "indis başına" çıkar; metreye bölme bir sonraki işlemdir.'},{line:27,text:"ζ = ∂v/∂x − ∂u/∂y: pozitif değer kuzey yarımkürede siklonik dönüş."},{line:28,text:"Yatay ıraksama: negatif değer yakınsama, yani alt seviyede yükseliş demektir."},{line:29,text:"Coriolis parametresi doğrudan yayılmış enlem dizisinden; ayrı bir 2B ızgara kurmaya gerek yok."},{line:37,text:"Sonucu düz numpy dizisi olarak bırakmak yerine Dataset'e koymak: koordinatlar ve birimler veriyle birlikte seyahat eder."},{line:43,text:"Birim özniteliği eklemek zorunlu değil ama sonraki okuyucular (ve gelecekteki siz) için hayati."}],explain:["Sonlu farkla türev almanın üç ayrı adımı vardır: doğru eksende türev, doğru metrik (metre cinsinden mesafe) ve doğru işaret (eksen yönü). Üçünden biri yanlışsa sonuç sessizce bozulur.","np.gradient merkezi farkı kullanır ve ikinci mertebe doğrudur; uçlarda tek yanlı fark uygular, bu yüzden haritanın kenar şeridi daha gürültülüdür.","Yayılım (broadcasting) sayesinde dx için tam bir (ny, nx) matris kurmak gerekmez; numpy bunu bellekte üretmeden hesaplayabilir. Büyük ızgarada bu ciddi bir tasarruftur.","Bağıl vortisite ve ıraksama birlikte okunur: çukur ekseninin önünde pozitif vortisite adveksiyonu ve üst seviyede ıraksama varsa, alt seviyede yükseliş ve basınç düşüşü beklenir.","Mutlak vortisitenin negatife düşmesi kuzey yarımkürede atalet kararsızlığına işaret eder; genellikle jet çıkışı bölgelerinde, konvektif gelişime elverişli ortamlarda görülür.","Sonucu koordinatlı bir Dataset olarak yazmak, hesabı yeniden üretilebilir kılar: dosyayı altı ay sonra açan kişi hangi alanın hangi eksende olduğunu tahmin etmek zorunda kalmaz."],output:"`zeta : -14.2 .. +21.7 (1e-5 1/s)`, `divh : -8.9 .. +9.4 (1e-5 1/s)` ve `eta<0: 0 nokta` benzeri üç satır. Diske dyn500.nc yazılır: zeta, eta, divh değişkenleri ile enlem-boylam koordinatları. Türkiye enleminde f ≈ 9.3×10⁻⁵ s⁻¹ olduğu için η genellikle pozitif kalır.",pitfalls:['Enlem yönünü düzeltmeyi unutmak: vortisite haritası ters işaretli çıkar ama "makul" göründüğü için fark edilmez. Kontrol: belirgin bir alçak basıncın merkezinde ζ POZİTİF olmalı (kuzey yarımkürede).',"cos(φ) çarpanını unutmak veya dx'i sabit almak: hata enlemle sistematik olarak değişir, bu yüzden haritada sahte bir kuzey-güney eğimi doğar.","np.gradient'e aralık argümanı vermek (np.gradient(U, dy, axis=0)) ile sonucu sonradan bölmek aynı şeydir; ikisini birden yapmak iki kez bölmek demektir — sık rastlanan bir hata.","Kutba çok yakın enlemlerde cos(φ) sıfıra gider ve dx çöker; küresel alan işlerken |φ| > 88° şeridini maskeleyin."],run:{level:"500",script:`set lev 500
set gxout shaded
set cmap rdbu
set cbar on
set title Mutlak vortisite  eta = hcurl(u,v) + f   (1/s)
d hcurl(u,v) + f`,bridge:"Python kodu ζ, ıraksama ve η'yı numpy ile elle hesaplar. Mini motorda aynı hesap hazır: `hcurl(u,v)` küresel metrikli bağıl vortisiteyi, `f` ise Coriolis parametresini verir; toplamları η'dır. Sağdaki harita bu toplamın gerçek 500 hPa alanındaki değeridir. Renklerin neredeyse tamamen tek yönde kalması beklenir — orta enlemlerde f terimi ζ'yı baskılar; kodun `eta<0` sayacının sıfır çıkmasının sebebi budur."},level:3,tags:["numpy","gradient","vortisite","ıraksama","küresel metrik"]},{id:"python-metpy-skewt",title:"MetPy — Skew-T log-p diyagramı, LCL, CAPE ve CIN",lang:"python",goal:"Radiosonde verisinden parsel yolunu çıkarmak, LCL/CAPE/CIN/LI/PW değerlerini hesaplamak ve standart Skew-T log-p diyagramını gölgeli alanlarla birlikte çizmek.",data:"17064_2026011500.csv — Wyoming arşivinden ayıklanmış sondaj: p (hPa), T (°C), Td (°C), wdir (°), wspd (knot).",code:`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import metpy.calc as mpcalc
from metpy.plots import SkewT
from metpy.units import units

df = pd.read_csv("17064_2026011500.csv").dropna(subset=["p", "T", "Td"])
df = df[df["p"] >= 100]                 # 100 hPa ustunu at

p  = df["p"].values * units.hPa
T  = df["T"].values * units.degC
Td = df["Td"].values * units.degC
u, v = mpcalc.wind_components(df["wspd"].values * units.knots,
                              df["wdir"].values * units.degrees)

lcl_p, lcl_t = mpcalc.lcl(p[0], T[0], Td[0])
prof = mpcalc.parcel_profile(p, T[0], Td[0]).to("degC")
cape, cin = mpcalc.cape_cin(p, T, Td, prof)
li = mpcalc.lifted_index(p, T, prof)
pw = mpcalc.precipitable_water(p, Td)

print(f"LCL  : {lcl_p:.0f}  ({lcl_t:.1f})")
print(f"CAPE : {cape:.0f}   CIN: {cin:.0f}")
print(f"LI   : {li[0]:.1f}   PW: {pw.to('mm'):.1f}")

fig = plt.figure(figsize=(7.5, 8.5))
skew = SkewT(fig, rotation=45)
skew.plot(p, T, "red", linewidth=1.6, label="T")
skew.plot(p, Td, "green", linewidth=1.6, label="Td")
skew.plot(p, prof, "black", linewidth=1.1, label="parsel")
skew.plot(lcl_p, lcl_t, "ko", markerfacecolor="black")
skew.shade_cape(p, T, prof)
skew.shade_cin(p, T, prof)
skew.plot_barbs(p[::3], u[::3], v[::3])
skew.plot_dry_adiabats(linewidth=0.5, alpha=0.6)
skew.plot_moist_adiabats(linewidth=0.5, alpha=0.6)
skew.plot_mixing_lines(linewidth=0.5, alpha=0.6)
skew.ax.set_ylim(1020, 100)
skew.ax.set_xlim(-45, 40)
skew.ax.legend(loc="upper left", fontsize=8)
plt.title("Skew-T log-p - 17064, 2026-01-15 00 UTC")
plt.savefig("skewt.png", dpi=150, bbox_inches="tight")`,lineNotes:[{line:8,text:"dropna ile eksik satırlar atılıyor: MetPy hesapları NaN içeren profili kabul etmez."},{line:9,text:"100 hPa üstünü atmak standart uygulamadır; stratosferik kuyruk parsel hesabına bir şey katmaz."},{line:11,text:"MetPy BİRİMLİ dizilerle çalışır (pint). Birimi yazmadan geçirilen dizi hata verir — bu bir özelliktir, birim hatalarını baştan keser."},{line:14,text:"wind_components yön ve şiddetten u/v üretir; meteorolojik yön kuralını (rüzgârın GELDİĞİ yön) doğru uygular."},{line:17,text:"LCL: yüzey parselinin doyduğu seviye. Bulut tabanı yüksekliğinin ilk kestirimi budur."},{line:18,text:"parcel_profile yüzeyden başlayan parselin sıcaklık yolu: LCL'e kadar kuru adyabat, sonra doymuş adyabat."},{line:19,text:"cape_cin parsel ile çevre arasındaki pozitif ve negatif alanları integre eder."},{line:20,text:"Lifted index: 500 hPa'da çevre sıcaklığı eksi parsel sıcaklığı. Negatifse kararsız."},{line:21,text:"Yağışabilir su: sütundaki toplam su buharının mm cinsinden karşılığı."},{line:28,text:"SkewT nesnesi eksenleri kendisi kurar; rotation=45 sıcaklık eksenlerinin eğimidir (klasik diyagram)."},{line:32,text:"LCL noktası diyagrama işaretleniyor: parselin kuru adyabattan doymuş adyabata geçtiği kırılma."},{line:33,text:"shade_cape parselin çevreden sıcak olduğu alanı boyar: gözle CAPE tahmini yapmanın yolu."},{line:35,text:"Rüzgâr okları seyreltilerek (her 3. seviye) çiziliyor; yoksa sağ kenar okunmaz olur."},{line:36,text:"Kuru adyabat, doymuş adyabat ve karışım oranı çizgileri arka plan referansıdır; onlarsız diyagram okunmaz."},{line:39,text:"y ekseni ters (1020 → 100): basınç yukarı doğru azalır."}],explain:["Skew-T log-p, dikey eksende log(p), yatay eksende eğik sıcaklık kullanan bir diyagramdır. Eğim sayesinde kuru adyabatlar, doymuş adyabatlar ve karışım oranı çizgileri birbirinden ayrışır ve alanlar enerjiyle orantılı olur.","Parsel yolu iki parçadır: LCL'e kadar kuru adyabatik (θ korunur), LCL'den sonra doymuş adyabatik (θe korunur). MetPy bu geçişi parcel_profile içinde kendisi yapar.",'CAPE, parselin çevreden sıcak olduğu bölgenin alanıdır ve konvektif potansiyeli J/kg cinsinden verir. CIN ise parselin aşması gereken negatif alan — "kapak" budur.',"Yüksek CAPE tek başına fırtına demek değildir: CIN büyükse tetikleyici olmadan hiçbir şey olmaz. İkisi birlikte okunur.","MetPy'ın birim sistemi (pint) tasarım gereği katıdır: hPa ile Pa, °C ile K karıştırılamaz. Bu, termodinamik hesaplarda en yaygın hata sınıfını derleme zamanına taşır.","Yağışabilir su (PW) ile CAPE birlikte, şiddetli yağış potansiyelini kabaca çerçeveler: yüksek PW + orta CAPE, düşük PW + yüksek CAPE'ten daha fazla yağış üretir."],output:"Konsolda üç satır: `LCL  : 947 hectopascal  (8.1 degree_Celsius)`, `CAPE : 412 joule / kilogram   CIN: -38 joule / kilogram`, `LI   : -1.8 delta_degree_Celsius   PW: 21.4 millimeter`. Diske skewt.png: kırmızı sıcaklık, yeşil çiy noktası, siyah parsel eğrisi, LCL noktası, kırmızı gölgeli CAPE ve mavi gölgeli CIN alanları, sağda rüzgâr okları.",pitfalls:["Birim eklemeyi unutmak: MetPy açık bir hata fırlatır (`Expected unit`), bu iyi haberdir. Kötü haber, hPa yerine Pa eklemektir — hata çıkmaz, sonuç anlamsız olur.","Basınç dizisinin AZALAN sırada olması beklenir (yüzeyden yukarı). Wyoming çıktısı zaten böyledir ama kendi ürettiğiniz profilde sıralamayı doğrulayın.","cape_cin yüzey parseli varsayar. En kararsız parsel (MU) ya da karışık katman (ML) için mpcalc.most_unstable_parcel / mixed_parcel kullanılmalıdır; farklı parsel seçimi CAPE'i kat kat değiştirir.",'lifted_index tek elemanlı bir dizi döndürür; skaler gibi biçimlendirmeye çalışmak (f"{li:.1f}") hata verir. Bu yüzden li[0] yazılmıştır.'],run:{level:"surface",script:`set lev surface
set gxout shaded
set cmap magma
set cbar on
set title Cig noktasi acigi T - Td (C): kucuk deger = doyguna yakin
d t - td`,bridge:"MetPy kodu TEK bir sondaj noktasında düşey profili çözer. Tarayıcıda MetPy yok; sağdaki harita aynı fikrin yüzeydeki yatay karşılığıdır: T − Td, yani çiy noktası açığı. Sondajda bu fark LCL yüksekliğini belirler (fark küçükse bulut tabanı alçak). Haritada koyu bölgeler havanın doyguna yakın olduğu, yani sondaj çekilse LCL'in yere yakın çıkacağı yerlerdir."},level:3,tags:["MetPy","Skew-T","CAPE","LCL","sondaj"]},{id:"python-pandas-station",title:"pandas — istasyon verisinde eksik saat, günlük özet ve sıcak dalga",lang:"python",goal:"Saatlik istasyon kaydını tam bir zaman eksenine oturtup eksikleri görünür kılmak, günlük özetleri kalite eşiğiyle üretmek, yerel saate göre günlük döngüyü çıkarmak ve ardışık sıcak günleri saymak.",data:"istasyon_17060.csv — time (ISO), temp (°C), rain (mm). Saatlik, çok yıllık.",code:`import pandas as pd
import numpy as np

df = pd.read_csv("istasyon_17060.csv", parse_dates=["time"]).set_index("time")
df = df.tz_localize("UTC")

# 1) Tam saatlik eksene otur: EKSIK saatler NaN olarak GORUNSUN
df = df.asfreq("1h")
print("eksik saat:", int(df["temp"].isna().sum()), "/", len(df))

# 2) Kisa boslugu doldur, uzun boslugu BIRAK (uydurma veri uretme)
df["temp"] = df["temp"].interpolate(limit=3, limit_area="inside")

# 3) Gunluk ozetler; yetersiz gun elenir
gunluk = df.resample("1D").agg(
    tmax=("temp", "max"), tmin=("temp", "min"), tort=("temp", "mean"),
    rr=("rain", "sum"), n=("temp", "count"))
gunluk = gunluk[gunluk["n"] >= 20]

# 4) Gunluk dongu: YEREL saate gore grupla (UTC ile 3 saat kayar)
yerel = df.index.tz_convert("Europe/Istanbul")
dongu = df["temp"].groupby(yerel.hour).mean()
print(dongu.round(1).to_string())

# 5) Gunun yilina gore iklim normali ve anomali
gunluk["doy"] = gunluk.index.dayofyear
norm = gunluk.groupby("doy")["tort"].transform("mean")
gunluk["anomali"] = gunluk["tort"] - norm

# 6) Sicak dalga: ust uste kac gun tmax >= %95 yuzdeligi
esik = gunluk["tmax"].quantile(0.95)
sicak = gunluk["tmax"] >= esik
seri = sicak.groupby((~sicak).cumsum()).cumsum()
print("esik %.1f C | en uzun sicak dizi: %d gun" % (esik, int(seri.max())))

# 7) En sicak gunler ve disa yazim
print(gunluk.nlargest(5, "tmax")[["tmax", "tort", "anomali"]].round(1))
gunluk.to_csv("gunluk_17060.csv", float_format="%.1f")`,lineNotes:[{line:4,text:"parse_dates ile zaman sütunu doğrudan datetime'a çevrilip indis yapılıyor; pandas'ın tüm zaman araçları buna bağlı."},{line:5,text:'tz_localize("UTC") indise saat dilimi bilgisi ekler. Saat dilimsiz indis, yerel/UTC karışıklığının kaynağıdır.'},{line:8,text:'asfreq("1h") eksik saatleri NaN olarak EKLER. Eksikleri görünür kılmadan hesaplamak, onları sessizce yok saymaktır.'},{line:12,text:'interpolate(limit=3): en fazla 3 ardışık NaN doldurulur. limit_area="inside" serinin uçlarını doldurmaz.'},{line:15,text:"resample + adlandırılmış toplama: her çıktı sütunu (kaynak sütun, işlev) çiftiyle tanımlanır."},{line:17,text:"n sütunu o gün kaç geçerli ölçüm olduğunu sayar; kalite filtresinin dayanağı."},{line:18,text:"20 saatten az veri olan günler atılıyor: kısmi günler ortalamayı sistematik olarak kaydırır."},{line:21,text:"tz_convert saat dilimini çevirir (tz_localize'dan farklı: o etiket ekler, bu değeri kaydırır)."},{line:22,text:"Yerel saate göre gruplamak günlük döngüyü doğru hizalar; UTC ile gruplamak tepeyi 3 saat kaydırır."},{line:26,text:"dayofyear: aynı takvim gününü farklı yıllar boyunca eşleştirmek için."},{line:27,text:'transform("mean") grup ortalamasını HER SATIRA geri yayar; merge yazmadan anomali almanın kısa yolu.'},{line:32,text:"Boolean seri: eşik aşan günler True."},{line:33,text:"(~sicak).cumsum() her kesinti noktasında artan bir grup anahtarı üretir; grup içinde cumsum ardışık True uzunluğunu sayar. Ardışık koşu (run) uzunluğu bulmanın standart pandas deyimi budur."},{line:37,text:"nlargest sıralama yapmadan en büyük n satırı verir; büyük tablolarda sort_values'tan hızlıdır."}],explain:['Zaman serisi analizinde ilk iş veriyi tam bir eksene oturtmaktır. Eksik satırlar "yok" değil "bilinmiyor"dur; asfreq bu farkı görünür kılar.',"Doldurma politikası açıkça yazılmalıdır: 3 saatlik boşluğu doğrusal doldurmak makul, 3 günlük boşluğu doldurmak veri uydurmaktır. limit parametresi bu sınırı koda gömer.","Saat dilimi iki ayrı işlemdir: tz_localize saat dilimsiz bir zamana etiket yapıştırır, tz_convert ise etiketli bir zamanı başka dilime çevirir. Karıştırmak veriyi saatlerce kaydırır.",'Günlük döngü yerel saate göre hesaplanmalıdır; UTC ile hesaplanan "en sıcak saat" Türkiye için üç saat erken çıkar ve fiziksel yorum bozulur.',"Ardışık koşu sayma deyimi ((~mask).cumsum() ile gruplama) sıcak dalga, kurak dönem, don serisi gibi süreklilik gerektiren tüm tanımlarda kullanılır.","Yüzdelik tabanlı eşik (95. yüzdelik) mutlak eşiğe (ör. 35 °C) göre iklime uyarlanır: aynı kod hem Antalya hem Erzurum için anlamlı sonuç verir."],output:"`eksik saat: 412 / 87648`, ardından 24 satırlık saatlik ortalama tablosu (yerel saatte tepe 14–15 civarında), `esik 34.2 C | en uzun sicak dizi: 9 gun` ve en sıcak beş günün tablosu. Diske gunluk_17060.csv yazılır (R örneklerinin girdisiyle aynı biçimde).",pitfalls:["tz_localize'ı iki kez çağırmak `Already tz-aware` hatası verir; zaten saat dilimli veride tz_convert kullanılmalıdır.",'asfreq atlanırsa eksik saatler hiç görünmez ve resample("1D").mean() var olan ölçümlerin ortalamasını alır — gecesi eksik bir gün olduğundan sıcak görünür.',"Yaz saati uygulaması olan dönemlerde Europe/Istanbul dilimine çevirmek tekrar eden/atlanan saatler üretir. Türkiye 2016'dan beri sabit UTC+3 kullanır ama eski kayıtlarda bu tuzak canlıdır.",'resample("1D") UTC gününe göre böler. Yerel günlük tmax istiyorsanız önce indisi tz_convert ile çevirin, sonra resample edin; sıra yanlışsa günlük maksimumlar gece yarısında bölünür.'],level:2,tags:["pandas","zaman serisi","eksik veri","saat dilimi","sıcak dalga"]}]},{id:"araclar",title:"Linux veri araçları — CDO, NCO, wgrib2 ve kabuk",emoji:"🛠️",intro:"Model çıktısıyla çalışan herkesin günü şu üç soruyla başlar: bu dosyada ne var, gereken parçayı nasıl alırım, gigabaytları indirmeden nasıl çalışırım. Cevap komut satırındadır: wgrib2 GRIB envanterini, CDO iklim işlemlerini, NCO netCDF cerrahisini, kabuk ise hepsini birbirine bağlayan tutkalı sağlar. Bu grupta tek satırlık komutlardan başlayıp, GFS'ten yalnız gereken kayıtları indiren bir betiğe kadar gidiyoruz.",examples:[{id:"cdo-mean",title:"CDO — alan kırpma, zaman ortalaması, iklim normali ve anomali",lang:"cdo",goal:"Çok yıllık bir 2 m sıcaklık dosyasından Türkiye kutusunu kesip aylık ortalama, ay-bazlı iklim normali ve anomali serisi üretmek; alan ortalamasını enlem ağırlıklı almak.",data:"era5_t2m_2026.nc — saatlik ya da aylık 2 m sıcaklık (K), küresel, CF uyumlu NetCDF.",code:`#!/usr/bin/env bash
set -euo pipefail

IN=era5_t2m_2026.nc
BOX=25,45,35,43                 # lon1,lon2,lat1,lat2 - Turkiye

# 0) Ne var ne yok: degisken, izgara, zaman ekseni
cdo sinfon "$IN"
cdo showdate "$IN" | tr ' ' '\\n' | sed -n '1p;$p'

# 1) ONCE kirp, SONRA hesapla: is yuku 20 kat duser
cdo -sellonlatbox,$BOX "$IN" tr_t2m.nc

# 2) Tum donemin zaman ortalamasi (tek alan cikar)
cdo timmean tr_t2m.nc tr_t2m_ort.nc

# 3) Aylik ortalama + ay-bazli iklim normali
cdo -monmean tr_t2m.nc tr_t2m_aylik.nc
cdo -ymonmean tr_t2m_aylik.nc tr_t2m_iklim.nc

# 4) Anomali = aylik deger - o ayin normali
cdo ymonsub tr_t2m_aylik.nc tr_t2m_iklim.nc tr_t2m_anom.nc

# 5) Alan ortalamasi ENLEM AGIRLIKLI olmali; fldmean bunu kendi yapar
cdo -outputtab,date,value -fldmean tr_t2m_anom.nc > anom_seri.txt
head -5 anom_seri.txt

# 6) Birim donusumu HAM alanda yapilir, anomalide degil
cdo -setattribute,t2m@units=degC -subc,273.15 tr_t2m_aylik.nc tr_t2m_aylik_C.nc

# 7) Mevsimlik ve yillik ozetler
cdo seasmean tr_t2m_aylik_C.nc tr_t2m_mevsim.nc
cdo yearmean tr_t2m_aylik_C.nc tr_t2m_yillik.nc

# 8) Tek nokta serisi (Istanbul) - en yakin izgara noktasi
cdo -outputtab,date,value -remapnn,lon=28.98_lat=41.01 tr_t2m_aylik_C.nc > ist.txt
wc -l ist.txt anom_seri.txt`,lineNotes:[{line:2,text:"set -euo pipefail: hata varsa dur, tanımsız değişkende dur, boru hattındaki hatayı yut(ma). Her veri betiğinin ilk satırı bu olmalı."},{line:5,text:"Kutu sırası CDO'da lon1,lon2,lat1,lat2'dir. Enlem-önce yazmak hata vermez, sadece yanlış bölgeyi keser."},{line:8,text:"sinfon dosyanın tam künyesini basar: değişkenler, seviyeler, ızgara tipi, zaman adımı sayısı ve aralığı."},{line:9,text:"showdate tüm tarihleri tek satırda verir; ilk ve son tarihi görmek için satıra bölünüp uçlar alınıyor."},{line:12,text:"Tire ile başlayan operatörler (-sellonlatbox) zincirlenebilir: ara dosya yazılmaz, bellekte akar."},{line:12,text:"Kırpmayı en başa koymak tüm zincirin maliyetini düşürür. Küresel veride ortalama alıp sonra kesmek kaynak israfıdır."},{line:15,text:"timmean tüm zaman adımlarını tek alana indirir."},{line:18,text:"monmean her takvim ayının kendi ortalaması (2026-01, 2026-02, ...)."},{line:19,text:"ymonmean ise ay NUMARASINA göre ortalar (tüm Ocaklar birlikte): iklim normali budur. monmean ile ymonmean farkı CDO'nun en sık karıştırılan ikilisidir."},{line:22,text:"ymonsub her aylık değerden o ayın normalini çıkarır; mevsim döngüsü arındırılır."},{line:25,text:"fldmean alan ortalaması alırken hücre alanlarını (cos φ) hesaba katar. Basit ortalama kutupları aşırı ağırlıklandırır."},{line:25,text:"outputtab,date,value düz metin tablo basar: gnuplot/pandas için hazır."},{line:29,text:"subc,273.15 sabit çıkarır; setattribute birim etiketini de günceller. Etiketi güncellemeden birim değiştirmek sonraki aracı yanıltır."},{line:36,text:"remapnn ile tek noktaya en yakın komşu: istasyon karşılaştırması için pratik tek satır."}],explain:["CDO (Climate Data Operators) 700'den fazla operatörü olan bir komut satırı aracıdır; NetCDF ve GRIB üzerinde çalışır ve tek satırda çoğu iklim işlemini bitirir.","Operatör zincirleme CDO'nun en değerli özelliğidir: `cdo -monmean -sellonlatbox,... in.nc out.nc` ara dosya üretmeden akış hâlinde işler. Zincirdeki operatörler SAĞDAN SOLA uygulanır.","monmean/ymonmean ayrımı kavramsaldır: monmean zaman ekseninde ortalama (her ay ayrı), ymonmean ise ay numarasına göre iklimsel ortalama (tüm Ocaklar). Anomali hesabı ikisinin farkına dayanır.","Alan ortalaması enlem ağırlıklı olmalıdır: bir enlem-boylam ızgarasında kutba yakın hücreler çok daha küçüktür. fldmean bunu otomatik yapar; kendi kodunuzda cos(φ) ağırlığını elle vermeniz gerekir.","Kırpmayı zincirin başına koymak sadece hız değil bellek meselesidir: 50 yıllık küresel saatlik veri tek makinede ortalanamaz, Türkiye kutusu rahatça ortalanır.","Birim dönüşümünde öznitelik güncellemesi ihmal edilmemeli: değeri değiştirip etiketini bırakmak, dosyayı okuyacak bir sonraki aracın (ya da kişinin) yanlış yorumlamasına açık kapı bırakır."],output:"sinfon çıktısı (değişken tablosu, ızgara tanımı, zaman adımı sayısı), ilk ve son tarih, anom_seri.txt'nin ilk beş satırı (tarih ve anomali değeri), son satırda iki dosyanın satır sayısı. Diske sekiz NetCDF/metin dosyası yazılır; tr_t2m_anom.nc içindeki değerler sıfır etrafında salınır (mevsim döngüsü çıkarıldığı için).",pitfalls:["monmean ile ymonmean karıştırmak: anomali yerine sıfıra çok yakın ya da tamamen anlamsız bir seri üretirsiniz. Çıktının zaman adımı sayısına bakın — normal 12 adım olmalı.","sellonlatbox kutu sırası lon,lon,lat,lat'tır. Enlem-önce yazmak sessizce başka bir bölge keser; sonucu her zaman sinfon ile doğrulayın.","subc,273.15 işlemini anomali dosyasına uygulamak fiziksel olarak yanlıştır: fark alanının birimi zaten K/°C farkıdır, sabit çıkarmak onu bozar.","CDO bazı işlemlerde tüm zaman serisini belleğe alır (ör. detrend, eof). Büyük dosyada `-b F32` ile duyarlığı düşürmek ya da parçalara bölmek gerekebilir."],run:{level:"surface",script:`set lev surface
set gxout contour
set cint 4
set cbar off
set title Deniz seviyesi basinci (hPa) - alan ortalamasinin alindigi alan
d msl`,bridge:"CDO komutları tarayıcıda çalışmaz (dosya sistemi ve eccodes gerekir). Sağdaki harita, CDO'nun `fldmean` ile tek sayıya indirdiği türden bir ALANI gösterir: deniz seviyesi basıncı. `cdo fldmean` bu haritanın enlem ağırlıklı ortalamasını alır; `cdo timmean` ise aynı haritanın birçok saatlik kopyasını üst üste ortalar. Yani komutların girdisi tam olarak böyle bir alandır."},level:1,tags:["CDO","zaman ortalaması","iklim normali","anomali","fldmean"]},{id:"cdo-remap",title:"CDO remap — yeniden ızgaralama ve doğru yöntemi seçmek",lang:"cdo",goal:"Bir model çıktısını hedef ızgaraya taşımak; iki doğrusal, koruyucu ve en yakın komşu yöntemlerinin hangi alan için doğru olduğunu görmek ve ağırlıkları bir kez üretip tekrar kullanmak.",data:"gfs_0p25.nc (0.25° kaynak), era5_1deg.nc (hedef ızgara örneği), gfs_2026*.nc (toplu işlenecek dosyalar).",code:`#!/usr/bin/env bash
set -euo pipefail

SRC=gfs_0p25.nc          # kaynak: 0.25 derece kuresel
REF=era5_1deg.nc         # hedef izgaranin ornek dosyasi (varsa)

# 1) Izgarayi gor: gridtype, xsize/ysize, xfirst/xinc
cdo griddes "$SRC" > src_grid.txt
head -12 src_grid.txt

# 2) Hedef izgarayi ELLE tanimla (ornek dosya yoksa)
cat > tr_025.txt <<'EOF'
gridtype = lonlat
xsize    = 81
ysize    = 33
xfirst   = 25.0
xinc     = 0.25
yfirst   = 35.0
yinc     = 0.25
EOF

# 3) Iki dogrusal: SUREKLI alanlar (sicaklik, yukseklik, ruzgar)
cdo remapbil,tr_025.txt "$SRC" tr_bil.nc

# 4) Koruyucu: alan butcesi onemliyse (yagis, radyasyon akisi)
cdo remapcon,tr_025.txt "$SRC" tr_con.nc

# 5) En yakin komsu: KATEGORIK alan (arazi ortusu, yagis turu)
cdo remapnn,tr_025.txt "$SRC" tr_nn.nc

# 6) Agirliklari BIR KEZ uret, yuzlerce dosyada tekrar kullan
cdo genbil,tr_025.txt "$SRC" w_bil.nc
for f in gfs_2026*.nc; do
  cdo remap,tr_025.txt,w_bil.nc "$f" "tr_$(basename "$f")"
done

# 7) Dogrulama: toplam yagis korunuyor mu (con vs bil)
echo "kaynak  :"; cdo output -fldsum -selname,tp "$SRC" | head -2
echo "remapcon:"; cdo output -fldsum -selname,tp tr_con.nc | head -2
echo "remapbil:"; cdo output -fldsum -selname,tp tr_bil.nc | head -2

# 8) Hedef ornek dosya varsa izgara tanimi yerine dogrudan onu ver
cdo remapbil,"$REF" "$SRC" tr_ref.nc`,lineNotes:[{line:8,text:"griddes ızgaranın tam tanımını metin olarak verir; hedef ızgara yazarken şablon olarak kullanılır."},{line:12,text:"Heredoc ile ızgara tanım dosyası yazılıyor. Tırnaklı sınırlayıcı ('EOF') içerideki $ ve ` karakterlerinin genişletilmesini engeller."},{line:13,text:"gridtype = lonlat: düzenli enlem-boylam ızgarası. Diğer seçenekler gaussian, curvilinear, unstructured."},{line:14,text:"xsize/ysize hücre sayısı; xfirst ilk hücrenin MERKEZ koordinatı, xinc adım."},{line:23,text:"remapbil: dört komşudan ağırlıklı ara değer. Sürekli ve türevlenebilir alanlarda doğru seçim."},{line:26,text:"remapcon: hedef hücreye düşen kaynak hücre ALANLARINI tartar. Toplamı (bütçeyi) korur."},{line:29,text:"remapnn: en yakın hücrenin değerini aynen kopyalar. Ara değer üretmediği için kategorik alanlarda tek doğru yöntem."},{line:32,text:"genbil ağırlık matrisini hesaplayıp dosyaya yazar. Hesap pahalıdır, uygulama ucuzdur."},{line:34,text:"remap,izgara,agirlik hazır ağırlıkla çalışır: yüz dosyalık toplu işte süre 10 kat düşer."},{line:38,text:"cdo output değerleri düz metin basar; fldsum ile alan toplamı alınıp yöntemler karşılaştırılıyor."},{line:38,text:"Beklenti: remapcon toplamı kaynağa çok yakın tutar, remapbil sistematik olarak kaydırır."},{line:43,text:"Hedef ızgara bir örnek dosyadan da alınabilir; en pratik yol budur, ızgara tanımı yazmaya gerek kalmaz."}],explain:['Yeniden ızgaralama bir "yeniden çizim" değil, bir INTERPOLASYON kararıdır ve yöntem alanın doğasına göre seçilir. Yanlış yöntem veriyi sessizce bozar.',"İki doğrusal (bilinear) yöntem sürekli alanlarda pürüzsüz sonuç verir ama uçları törpüler: maksimumlar küçülür, minimumlar büyür. Yağış maksimumunu kaybetmenin tipik nedeni budur.","Koruyucu (conservative) yöntem alan integralini korur. Yağış, radyasyon akısı, kütle gibi bütçesi anlamlı büyüklüklerde zorunludur; özellikle kaba ızgaraya inerken.",'En yakın komşu ara değer ÜRETMEZ; arazi tipi, yağış türü, maske gibi kategorik alanlarda tek doğru seçenektir. Diğer yöntemler "yarı kar yarı yağmur" gibi var olmayan sınıflar uydurur.',"Ağırlık matrisini ayırmak (genbil + remap) toplu işlerde büyük kazanç sağlar: pahalı olan geometrik hesap bir kez yapılır, sonra her dosyaya ucuz bir matris çarpımı uygulanır.",'İnce ızgaradan kaba ızgaraya inerken bilgi kaybı kaçınılmazdır; kaba ızgaradan inceye çıkmak ise bilgi YARATMAZ, sadece yumuşatır. İkinci durumda "çözünürlük arttı" demek yanıltıcıdır.'],output:"griddes çıktısının ilk 12 satırı, üç ayrı NetCDF dosyası (tr_bil.nc, tr_con.nc, tr_nn.nc), toplu işlem sonucu `tr_gfs_2026*.nc` dosyaları ve son bölümde üç toplam yağış değeri. Beklenen: kaynak ile remapcon değerleri birkaç binde bir oranında yakın, remapbil ise belirgin biçimde farklı.",pitfalls:["Yağışı remapbil ile taşımak: toplam yağış korunmaz ve yerel maksimumlar törpülenir. Fark küçük görünür ama su bütçesi hesabını bozar.","Kategorik alanı (arazi tipi, yağış türü) bilinear/conservative ile taşımak var olmayan ara sınıflar üretir. Her zaman remapnn kullanın.","Ağırlık dosyası KAYNAK ve HEDEF ızgara çiftine özeldir. Farklı çözünürlükte bir dosyaya aynı ağırlığı uygulamak ya hata verir ya da sessizce yanlış eşleştirir.","xfirst değerinin hücre merkezi mi kenarı mı olduğu karıştırılırsa tüm alan yarım hücre kayar. Sonucu kaynakla aynı noktada örnekleyip karşılaştırarak doğrulayın."],run:{level:"700",script:`set lev 700
set gxout shaded
set cmap viridis
set cbar on
set title 700 hPa ruzgar hizi - yumusatilmis (interpolasyonun torpuleme etkisi)
d smth9(ws)`,bridge:'CDO tarayıcıda çalışmaz. Sağdaki harita remapbil\'in yan etkisini canlı gösterir: `smth9()` dokuz noktalı ağırlıklı ortalamadır ve tıpkı iki doğrusal interpolasyon gibi keskin uçları törpüler. İfadeyi `d ws` ile değiştirip iki haritayı karşılaştırın — jet çekirdeğinin en yüksek değeri yumuşatılmış sürümde belirgin biçimde düşer. Kabaca "remapbil ile yağış maksimumunu kaybetmek" budur.'},level:2,tags:["CDO","remap","interpolasyon","koruyucu","ızgara tanımı"]},{id:"nco-subset",title:"NCO — ncks/ncra ile alt küme, ortalama ve öznitelik cerrahisi",lang:"nco",goal:"Bir netCDF dosyasından değişken ve koordinat bazlı alt küme almak, zaman ortalaması ve anomali üretmek, türetilmiş değişken tanımlamak ve dosyayı sıkıştırarak yeniden yazmak.",data:"era5_pl_202601.nc — basınç seviyesi dosyası: t, z, u, v; boyutlar time, level, latitude, longitude.",code:`#!/usr/bin/env bash
set -euo pipefail

IN=era5_pl_202601.nc

# 0) Basligi oku: degiskenler, boyutlar, oznitelikler
ncdump -h "$IN" | head -30

# 1) Degisken secimi (-v): yalniz t ve z kalsin
ncks -O -v t,z "$IN" tz.nc

# 2) KOORDINAT DEGERI ile dilimleme: -d ad,min,max
ncks -O -d longitude,25.0,45.0 -d latitude,35.0,43.0 -d level,500.0,500.0 \\
     -v t,z "$IN" tr_500.nc

# 3) INDIS ile dilimleme: -F = 1'den baslayan sayim; ad,ilk,son,adim
ncks -O -F -d time,1,24,3 tr_500.nc tr_500_3sa.nc

# 4) Zaman ortalamasi (record boyutu uzerinden)
ncra -O tr_500_3sa.nc tr_500_ort.nc

# 5) Cok dosyayi zaman ekseninde birlestir
ncrcat -O tr_500_2026??.nc tr_500_yil.nc

# 6) Aritmetik: fark alani (ncbo) - anomali
ncbo -O --op_typ=sub tr_500_3sa.nc tr_500_ort.nc tr_500_anom.nc

# 7) Turetilmis degisken ve birim (ncap2)
ncap2 -O -s 'gh=z/9.80665; gh@units="gpm"; gh@long_name="jeopotansiyel yukseklik"' \\
      tr_500.nc tr_500_gh.nc

# 8) Oznitelik duzenleme: global baslik ekle
ncatted -O -a title,global,o,c,"Turkiye 500 hPa alt kumesi" tr_500_gh.nc

# 9) NetCDF4 + sikistirma + zaman-dilimi chunk'i
ncks -O -4 -L 4 --cnk_dmn time,1 tr_500_gh.nc tr_500_gh_z.nc
ls -lh tr_500_gh.nc tr_500_gh_z.nc

# 10) Boyut sirasini degistir (bazi araclar time'i once ister)
ncpdq -O -a time,level,latitude,longitude tr_500_gh_z.nc tr_500_gh_zt.nc
ncdump -h tr_500_gh_zt.nc | head -12`,lineNotes:[{line:7,text:"ncdump -h yalnız başlığı basar (veriyi değil). Herhangi bir netCDF işine başlamadan önceki zorunlu ilk adım."},{line:10,text:"-O çıktı dosyasının üzerine yazmaya izin verir; olmadan NCO var olan dosyada sorar ve betik takılır."},{line:10,text:"-v ile değişken seçimi koordinat değişkenlerini otomatik taşır; ayrıca yazmanız gerekmez."},{line:13,text:"-d ad,min,max biçimi KOORDİNAT DEĞERİ kullanır (nokta içeren sayı yazmak bunu belirtir)."},{line:13,text:"Satır sonundaki ters bölü komutu bir sonraki satıra taşır; öncesinde boşluk, sonrasında hiçbir şey olmamalı."},{line:17,text:"-F Fortran usulü 1-tabanlı sayım açar. -F olmadan indisler 0'dan başlar — en sık yapılan NCO hatası."},{line:17,text:"Dördüncü alan adım: her 3. zaman adımı alınır (1, 4, 7, ...)."},{line:20,text:"ncra record (genelde time) boyutu üzerinden ortalama alır ve o boyutu 1'e indirir."},{line:23,text:"ncrcat dosyaları record boyutunda ARDIŞIK ekler; ncra ortalar, ncrcat birleştirir."},{line:26,text:"ncbo iki dosya arasında eleman bazlı işlem yapar; tek kayıtlı dosya çok kayıtlıya karşı yayılır."},{line:29,text:"ncap2 küçük bir betik dili çalıştırır: yeni değişken tanımlar, öznitelik atar, aritmetik yapar."},{line:33,text:"ncatted -a ad,kapsam,mod,tip,deger: o = overwrite (yoksa oluşturur), c = character."},{line:36,text:"-4 netCDF4 biçimi, -L 4 deflate seviyesi, --cnk_dmn time,1 zaman ekseninde tek dilimlik chunk."},{line:40,text:"ncpdq boyut sırasını değiştirir (permute dimensions); bazı araçlar belirli sıra bekler."}],explain:['NCO (netCDF Operators) netCDF dosyaları üzerinde "cerrahi" yapar: değişken seç, boyut dilimle, birleştir, öznitelik düzenle. CDO iklim işlemlerine, NCO dosya yapısına odaklıdır.',"-d bayrağının iki kipi vardır: ondalıklı sayı yazarsanız koordinat DEĞERİ, tam sayı yazarsanız İNDİS olarak yorumlanır. Bu incelik, sessiz hataların başlıca kaynağıdır.","ncra ile ncrcat aynı boyutta çalışır ama farklı iş yapar: ncra ortalama alır (boyut 1'e iner), ncrcat uç uca ekler (boyut büyür). Adlar benzediği için karıştırılır.","ncap2 küçük hesapları dosyanın içinde bitirir: Python açmadan jeopotansiyeli gpm'e çevirmek, rüzgâr hızı türetmek, birim etiketi yazmak tek satırda olur.",`Sıkıştırma ve chunk'lama birlikte düşünülmelidir: zaman ekseninde tek dilimlik chunk, "her seferinde bir zaman adımı okuyan" erişim deseni için optimaldir; alan bazlı erişim için farklı bir chunk şeması gerekir.`,"Boyut sırası (ncpdq) başarımı doğrudan etkiler: diskten okuma hızı, en içteki boyut boyunca ardışık olduğunda en yüksektir. Erişim deseniniz neyse boyut sırası ona göre olmalıdır."],output:"ncdump başlığının ilk 30 satırı, ardışık olarak üretilen sekiz netCDF dosyası, ls çıktısında sıkıştırılmış dosyanın ham sürümün yaklaşık üçte biri boyutunda olduğu, ve son ncdump ile yeni boyut sırasının doğrulanması.",pitfalls:["-F bayrağını unutmak: `-d time,1,24` ifadesi 0-tabanlı sayımda 2. adımdan 25.'e gider. Bir adımlık kayma fark edilmez ama zaman eşleştirmesini bozar.","-d ile tam sayı yazmak indis, ondalıklı yazmak koordinat demektir. `-d level,500` ile `-d level,500.0` TAMAMEN farklı sonuç verir.","ncbo ile farklı boyutlu dosyaları çıkarmak: NCO tek kayıtlı dosyayı yayar ama boyut adları birebir aynı değilse sessizce boş sonuç ya da hata verir. ncdump -h ile iki dosyayı karşılaştırın.","ncap2 içindeki ifade tek tırnak içinde olmalı; çift tırnak kullanırsanız kabuk $ ve tırnakları genişletir ve ifade bozulur."],run:{level:"925",script:`set lev 925
set gxout shaded+contour
set cmap thermal
set cint 2
set cbar on
set title 925 hPa sicaklik (C) - ncks ile kesilen alt kume
d t`,bridge:"NCO komutları dosya sistemi üzerinde çalışır, tarayıcıda yürütülemez. Sağdaki harita `ncks -d longitude,25,45 -d latitude,35,43 -d level,925,925` komutunun ürettiği alt kümenin görsel karşılığıdır: tek seviye, tek bölge, tek zaman adımı. Kodu çalıştırdığınızda elinizde kalan dosyanın içinde tam olarak bu sayılar olur."},level:2,tags:["NCO","ncks","ncra","ncap2","alt küme"]},{id:"wgrib2-inventory",title:"wgrib2 — GRIB envanteri, kayıt ayıklama ve nokta sorgusu",lang:"bash",goal:"Bir GFS GRIB2 dosyasının içinde ne olduğunu listelemek, desenle eşleşen kayıtları ayrı dosyaya çıkarmak, alanı kırpmak, NetCDF'e çevirmek ve tek nokta değeri okumak.",data:"gfs.t00z.pgrb2.0p25.f006 — GFS 0.25° 6 saatlik tahmin, yaklaşık 700 kayıt / 500 MB.",code:`#!/usr/bin/env bash
set -euo pipefail

G=gfs.t00z.pgrb2.0p25.f006

# 1) Envanter: kayit no : bayt ofseti : tarih : degisken : seviye : tahmin
wgrib2 "$G" | head -15
echo "toplam kayit: $(wgrib2 "$G" | wc -l)"

# 2) Arama (-s kisa envanter): 500 hPa jeopotansiyel yukseklik
wgrib2 -s "$G" | grep ':HGT:500 mb:'

# 3) Tek kaydi ayri GRIB dosyasina cikar
wgrib2 "$G" -match ':HGT:500 mb:' -grib hgt500.grb2

# 4) Coklu eslesme (ERE): 850 hPa sicaklik + ruzgar bilesenleri
wgrib2 "$G" -match ':(TMP|UGRD|VGRD):850 mb:' -grib lev850.grb2

# 5) Alan kirpma - DIKKAT: GFS boylami 0..360
wgrib2 lev850.grb2 -small_grib 25:45 35:43 lev850_tr.grb2

# 6) NetCDF'e cevir (CDO / xarray / MATLAB icin)
wgrib2 lev850_tr.grb2 -netcdf lev850_tr.nc

# 7) Tek nokta degeri: Istanbul (28.98 E, 41.01 N)
wgrib2 "$G" -match ':TMP:2 m above ground:' -lon 28.98 41.01

# 8) Istatistik ve CSV dokumu (tarih, lon, lat, deger)
wgrib2 hgt500.grb2 -stats
wgrib2 hgt500.grb2 -csv hgt500.csv
head -3 hgt500.csv

# 9) Birden cok tahmin saatini tek dosyada toplamak
for h in 006 012 018 024; do
  wgrib2 "gfs.t00z.pgrb2.0p25.f$h" -match ':APCP:' -append -grib apcp.grb2
done
wgrib2 apcp.grb2 | wc -l`,lineNotes:[{line:7,text:"Argümansız wgrib2 envanter basar: her satır bir GRIB mesajı. İkinci alan dosyadaki BAYT OFSETİdir — kısmi indirmenin temeli budur."},{line:8,text:"Kayıt sayısı: GFS 0.25° dosyasında tipik olarak 600–800 mesaj bulunur."},{line:11,text:"-s kısa envanter biçimi verir; grep ile aramak için daha uygundur."},{line:11,text:"Desendeki iki nokta üst üsteler alan sınırıdır: ':HGT:500 mb:' yazmak 'HGT' yazmaktan çok daha güvenlidir."},{line:14,text:"-match ile süzüp -grib ile yazmak: kaynak dosyadan mesajları OLDUĞU GİBİ kopyalar, yeniden kodlamaz."},{line:17,text:"Genişletilmiş düzenli ifade: tek geçişte üç değişken birden alınır."},{line:20,text:"-small_grib lon0:lon1 lat0:lat1 alanı keser. GFS boylamı 0–360 olduğu için negatif boylam yazmak boş sonuç verir."},{line:23,text:"-netcdf dönüşümü hızlıdır ama düzenli enlem-boylam ızgarası gerektirir; Lambert/ Gauss ızgarada önce yeniden ızgaralama gerekir."},{line:26,text:"-lon en yakın ızgara noktasının değerini basar; ara değer yapmaz."},{line:29,text:"-stats min/maks/ortalama/standart sapma verir: veri sağlığını denetlemenin en hızlı yolu."},{line:30,text:"-csv her ızgara noktasını satır olarak yazar; küçük alanlarda pratiktir, küresel alanda devasa dosya üretir."},{line:34,text:"Döngüde -append kullanmak dosyanın sonuna EKLER; olmadan her adım öncekini siler."},{line:37,text:"Sonuçta 4 kayıt olmalı; çıkmıyorsa desen ya da dosya adı yanlıştır."}],explain:["GRIB2 bağımsız mesajların art arda dizildiği bir biçimdir: her mesaj kendi başlığını ve sıkıştırılmış alanını taşır. Bu yüzden dosyayı ortadan kesip yapıştırmak geçerli bir GRIB verir.","Envanterdeki bayt ofseti, kısmi indirmenin (byte-range) anahtarıdır: sunucudan yalnız ilgili aralığı istemek 500 MB'lık dosyadan 2 MB indirmeyi mümkün kılar.","-match desenlerini alan sınırlarıyla (iki nokta üst üste) yazmak şarttır: 'TMP' deseni TMP:850 mb, TMP:2 m, TMPsfc gibi onlarca kaydı birden yakalar.","wgrib2 mesajları yeniden kodlamadan kopyalar; bu hem hızlıdır hem de kayıpsızdır. CDO/NCO ile GRIB işlemek çoğu zaman yeniden kodlama gerektirir.","GFS'in 0–360 boylam kuralı en sık tökezlenen ayrıntıdır: Avrupa'nın batısı 350–360 aralığındadır, −10 yazmak sonuç vermez.","GRIB'i hemen NetCDF'e çevirmek yaygın bir alışkanlıktır ama her zaman doğru değil: dosya boyutu büyür ve GRIB'in seviye/adım üstverisi bir kısmı kaybolabilir. Süzme ve kırpma işini GRIB üzerinde bitirip sonra çevirmek daha iyidir."],output:"İlk 15 envanter satırı (ör. `1:0:d=2026011500:HGT:10 mb:6 hour fcst:`), toplam kayıt sayısı, HGT:500 mb satırı, ayıklanan dosyalar (hgt500.grb2 ~1 MB, lev850_tr.grb2 birkaç yüz KB), -lon çıktısında tek değer, -stats satırında min/maks/ortalama ve CSV'nin ilk üç satırı.",pitfalls:["Deseni alan sınırı olmadan yazmak (`-match TMP`) beklenenden çok daha fazla kaydı çıkarır ve dosyayı şişirir. Önce grep ile kaç satır eşleştiğini sayın.","GFS boylamı 0–360'tır; -small_grib 25:45 çalışır ama -small_grib -10:5 boş döner. Batı boylamları için 350:365 biçiminde yazın.","-append olmadan döngü içinde -grib kullanmak her adımda dosyayı SİLER; döngü bitince elinizde yalnız son adım kalır ve hata mesajı çıkmaz.","-netcdf yalnız düzenli ızgarada güvenilir sonuç verir. Gauss ya da Lambert ızgaralı ürünlerde (ör. HRRR) önce -new_grid ile düzenli ızgaraya taşımak gerekir."],run:{level:"surface",script:`set lev surface
set gxout shaded
set cmap magma
set cbar on
set title CAPE (J/kg) - GRIB dosyasindan ayiklanacak turden bir alan
d cape`,bridge:"wgrib2 komutları yerel dosya üzerinde çalışır; tarayıcıda yürütülemez. Sağdaki harita, `-match ':CAPE:'` ile ayıklayacağınız türden TEK bir GRIB mesajının içeriğidir: bir zaman, bir seviye, bir değişken, bir ızgara. Envanterdeki her satır böyle bir haritaya karşılık gelir; 700 satırlık bir GFS dosyası 700 ayrı harita taşır."},level:2,tags:["wgrib2","GRIB2","envanter","ayıklama","GFS"]},{id:"bash-download-gfs",title:"Kısmi GFS indirme — .idx dosyası ve HTTP byte-range ile",lang:"bash",goal:"500 MB'lık bir GFS dosyasının tamamını indirmeden, yalnız gereken kayıtları (belirli değişken ve seviyeler) HTTP aralık istekleriyle çekip tek bir geçerli GRIB dosyası hâline getirmek.",data:"NOAA açık veri havuzu (AWS S3): gfs.YYYYMMDD/HH/atmos/ altında pgrb2 dosyaları ve yanlarında .idx envanterleri.",code:`#!/usr/bin/env bash
# GFS'ten YALNIZ gereken kayitlari indir: .idx + HTTP Range (500 MB -> ~15 MB)
set -euo pipefail

CYCLE="\${1:-2026011500}"        # YYYYMMDDHH
FH="\${2:-006}"                  # tahmin saati, 3 hane
DAY="\${CYCLE:0:8}"; HH="\${CYCLE:8:2}"
BASE="https://noaa-gfs-bdp-pds.s3.amazonaws.com/gfs.\${DAY}/\${HH}/atmos"
FILE="gfs.t\${HH}z.pgrb2.0p25.f\${FH}"
WANT=':(HGT|TMP|UGRD|VGRD):(500|850) mb:|:PRMSL:|:APCP:surface:'

# 1) Once .idx: her satir bir kaydin BAYT OFSETINI verir
curl -sSf --retry 3 "\${BASE}/\${FILE}.idx" -o idx.txt
[ -s idx.txt ] || { echo "idx bulunamadi: \${BASE}/\${FILE}.idx" >&2; exit 1; }
head -3 idx.txt

# 2) Istenen kayitlarin bayt araliklarini uret (son kayitta ust sinir bos)
awk -F: -v want="$WANT" '
  { off[NR] = $2; satir[NR] = $0 }
  END {
    for (i = 1; i <= NR; i++)
      if (satir[i] ~ want)
        printf "%s-%s\\n", off[i], (i < NR ? off[i+1] - 1 : "")
  }' idx.txt > araliklar.txt

n=$(wc -l < araliklar.txt)
[ "$n" -gt 0 ] || { echo "hicbir kayit eslesmedi; WANT desenini kontrol et" >&2; exit 2; }
echo "secilen kayit: $n"

# 3) Her araligi indir ve TEK dosyaya ekle (GRIB2 mesajlari yan yana durur)
: > "$FILE"
while read -r r; do
  curl -sSf --retry 3 -r "$r" "\${BASE}/\${FILE}" >> "$FILE"
done < araliklar.txt

# 4) Dogrula: kayit sayisi ve dosya boyutu
ls -lh "$FILE"
wgrib2 "$FILE" || { echo "GRIB bozuk - araliklar kaymis olabilir" >&2; exit 3; }

# 5) Hemen kirp ve NetCDF'e cevir
wgrib2 "$FILE" -small_grib 25:45 35:43 "tr_\${FILE}"
wgrib2 "tr_\${FILE}" -netcdf "tr_\${FILE}.nc"`,lineNotes:[{line:5,text:"Konumsal argüman yoksa varsayılan kullanılır; betik hem elle hem cron'dan çağrılabilir olur."},{line:7,text:"Kabuk alt dizgi genişletmesi: CYCLE'ın ilk 8 karakteri gün, sonraki 2 karakteri saat."},{line:8,text:"NOAA'nın S3 aynası kimlik doğrulaması istemez ve aralık isteklerini destekler."},{line:10,text:"Desen genişletilmiş düzenli ifadedir; alan sınırlarını (iki nokta üst üste) içerdiği için yanlış eşleşme riski düşüktür."},{line:13,text:".idx dosyası birkaç on kilobayttır: önce onu indirip hangi baytların gerektiğini öğreniyoruz."},{line:14,text:"-s sessiz, -S hatayı yine de göster, -f HTTP hata kodunda başarısız say. Üçü birlikte betiklerde zorunlu."},{line:18,text:"awk'a alan ayırıcı olarak iki nokta üst üste veriliyor: .idx satırının ikinci alanı bayt ofseti."},{line:19,text:"Tüm satırlar belleğe alınıyor çünkü bir kaydın BİTİŞİ, bir SONRAKİ kaydın başlangıcıdır."},{line:22,text:'Aralık "başlangıç-bitiş" biçiminde yazılıyor. Son kayıtta bitiş boş bırakılır: HTTP bunu "dosyanın sonuna kadar" olarak anlar.'},{line:25,text:"Hiç eşleşme yoksa erken çıkış: sessizce boş dosya üretmek en kötü sonuçtur."},{line:30,text:": > dosya — dosyayı sıfırlar. Önceki çalıştırmadan kalan içeriğin üstüne eklemeyi önler."},{line:32,text:"curl -r ile HTTP Range isteği; her kayıt ayrı bir istek olarak iner ve dosyaya eklenir."},{line:37,text:"wgrib2 ile doğrulama: mesajlar okunabiliyorsa aralıklar doğru hesaplanmış demektir."},{line:40,text:"İndirilen dosya zaten küçük ama kırpmak hem daha da küçültür hem sonraki adımları hızlandırır."}],explain:["GRIB2 dosyası bağımsız mesajların art arda dizilmesinden oluşur. Bu yapı, dosyanın ortasından bir parçayı kesip ayrı dosya yapmayı GEÇERLİ kılar — kısmi indirmenin bütün temeli budur.","Her GRIB dosyasının yanında bir .idx metin dosyası yayınlanır: kayıt numarası, bayt ofseti, tarih, değişken, seviye, tahmin adımı. Birkaç on kilobaytlık bu dosya, 500 MB'ın haritasıdır.","HTTP Range isteği (curl -r başlangıç-bitiş) sunucudan yalnız o bayt aralığını ister. S3 ve çoğu modern sunucu bunu destekler; desteklemiyorsa tüm dosya iner ve tasarruf kaybolur.","Bir kaydın bitiş ofseti .idx'te yazmaz; bir sonraki kaydın başlangıcının bir eksiğidir. Son kayıt için bitiş boş bırakılır. Bu ayrıntı yanlış yazılırsa dosya bozuk çıkar.","Operasyonel iş akışlarında bu yöntem zorunludur: saatte bir çalışan bir tahmin boru hattı, her çalışmada 500 MB yerine 15 MB indirerek hem hızlanır hem de ağ kotasını korur.","Betiğin sonunda doğrulama adımı olması şarttır: bozuk bir GRIB, sonraki tüm adımlarda anlamsız hatalar üretir ve kaynağı bulmak zaman alır."],output:".idx dosyasının ilk üç satırı, `secilen kayit: 11` benzeri bir sayı, ls çıktısında ~12–18 MB'lık GRIB dosyası, wgrib2 envanterinde seçilen kayıtların listesi ve son olarak Türkiye kutusuna kırpılmış GRIB ile NetCDF dosyaları. Tam dosya indirilseydi 450–550 MB olurdu.",pitfalls:['Bitiş ofsetini bir eksiltmeyi unutmak: aralıklar bir bayt taşar, mesajlar üst üste biner ve wgrib2 "bad grib message" hatası verir. Bozuk çıktının en sık nedeni budur.',"Desende alan sınırı kullanmamak: `:TMP:` yerine `TMP` yazmak 50'den fazla kaydı çeker ve tasarruf kaybolur. Önce grep ile kaç satır eşleştiğini sayın.","GFS dosyaları çevrim saatinden 3–5 saat sonra tamamlanır. Henüz yayınlanmamış bir adımı istemek 403/404 verir; betiğin curl -f ile erken durması bu yüzden önemlidir.",'Aynı dosyaya `>>` ile eklerken önceki çalıştırmadan kalan içeriği sıfırlamayı unutmak (`: > "$FILE"` satırı) dosyayı her çalıştırmada iki katına çıkarır ve GRIB\'i tekrarlı hâle getirir.'],run:{level:"surface",script:`set lev surface
set gxout shaded
set cmap blues
set cbar on
set title Yagis (mm) - indirilen APCP kaydinin icerigi
d prcp`,bridge:"Betik ağ üzerinden GRIB indirir; tarayıcıda ne curl ne wgrib2 vardır. Sağdaki harita, WANT deseninde geçen `:APCP:surface:` kaydının içeriğine karşılık gelen alandır: yağış. Betiği çalıştırdığınızda 15 MB'lık dosyanın içinden çıkacak olan haritalardan biri tam olarak budur — YolHava burada aynı büyüklüğü Open-Meteo'dan canlı alıp çiziyor, böylece indirmeden önce \"ne alacağınızı\" görmüş oluyorsunuz."},level:3,tags:["bash","byte-range","GFS","idx","kısmi indirme"]}]}];export{a as EXAMPLES_B};
