// -----------------------------------------------------------
// عند تحميل الصفحة بالكامل، نبدأ تشغيل الكود داخل دالة ready()
// -----------------------------------------------------------
$(document).ready(function () {
  // -----------------------------------------------------------
  // تعريف قائمة التطبيقات الافتراضية (بيانات ثابتة لعرضها في الجدول)
  // -----------------------------------------------------------
  const sampleApps = [
    {
      name: "ChatGPT [plus]",
      company: "OpenAI",
      domains: ["Education", "Productivity", "Research"],
      price: "مدفوع",
      website: "https://chat.openai.com",
      description:
        "ChatGPT هو مساعد لغوي متقدم يعتمد على نماذج كبيرة لتوليد نصوص ذكية. يمكن استخدامه في التعليم، انتاج المحتوى، ودعم العملاء بقدرات تواصلية متقدمة.",
      logo: "source/chatgpt.svg",
      youtube: "https://www.youtube.com/embed/OGmDr8TLtTo",
    },
    {
      name: "Google Gemini",
      company: "Google",
      domains: ["Productivity", "Research", "Multimodal"],
      price: "مجاني",
      website: "https://gemini.google.com",
      description:
        "Gemini هو نموذج متعدد المهام من جوجل يدعم النص، الصورة، والمهام التوليدية المتقدمة. مفيد للبحث، توليد الأفكار، وتحسين سير العمل.",
      logo: "source/gemini.svg",
      youtube: "https://www.youtube.com/embed/Fs0t6SdODd8",
    },
    {
      name: "Claude [Claude CLI]",
      company: "Anthropic",
      domains: ["E-Commerce", "Customer Support", "Research"],
      price: "مدفوع",
      website: "https://www.anthropic.com",
      description:
        "Claude AI نظام حواري يُركّز على الأمان والتعامل الطبيعي مع المستخدم. يُستخدم للأعمال التي تتطلب حوارات معقدة وخدمات ذكية.",
      logo: "source/claude.svg",
      youtube: "https://www.youtube.com/embed/XKX1C65W1EE",
    },
    {
      name: "DeepSeek",
      company: "DeepSeekLtd",
      domains: ["Robotics", "Search Engines", "Industry"],
      price: "مجاني",
      website: "https://chat.deepseek.com",
      description:
        "DeepSeek عبارة عن محرك بحث متخصص وتحليلات للبيانات الضخمة موجه لتطبيقات صناعية وروبوتية لتسريع الاستخراج واتخاذ القرار.",
      logo: "source/deepseek.svg",
      youtube: "https://www.youtube.com/embed/tR2azlV7RlQ",
    },
    {
      name: "Llama",
      company: "Meta",
      domains: ["Research", "Open Source", "Education"],
      price: "مجاني",
      website: "https://www.llama.com",
      description:
        "Llama هي عائلة نماذج مفتوحة المصدر تركز على البحث والتعاون العلمي. يمكن المطورين والباحثين الاستفادة منها لبناء حلول مخصصة.",
      logo: "source/llama.svg",
      youtube: "https://www.youtube.com/embed/x4-YyYTb72Y",
    },
  ];
  // نلاحظ ان البرمجيات مفتوحة المصدر تكون مجانية طبعا

  // -----------------------------------------------------------
  // دالة لتحويل رابط يوتيوب عادي إلى رابط تضمين (embed)
  // -----------------------------------------------------------
  function convertYoutubeUrl(url) {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1];
      const ampersandPosition = videoId.indexOf("&");
      return (
        "https://www.youtube.com/embed/" +
        (ampersandPosition !== -1
          ? videoId.substring(0, ampersandPosition)
          : videoId)
      );
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      const queryPosition = videoId.indexOf("?");
      return (
        "https://www.youtube.com/embed/" +
        (queryPosition !== -1 ? videoId.substring(0, queryPosition) : videoId)
      );
    }

    return url;
  }

  // -----------------------------------------------------------
  // دالة لاسترجاع تطبيق مؤقت من الرابط (hash) عند الانتقال من صفحة أخرى
  // تقوم بفك التشفير base64 ثم تحويله إلى كائن JSON
  // وبعدها تزيل الـ hash من الـ URL (replaceState)
  // -----------------------------------------------------------
  function getTransientAppFromHash() {
    if (!location.hash) return null;
    try {
      const encoded = decodeURIComponent(location.hash.slice(1));
      const decodedStr = atob(encoded);
      // تحويل السلسلة إلى Uint8Array ثم فك تشفير UTF-8
      const uint8 = Uint8Array.from(decodedStr, (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(uint8);
      const obj = JSON.parse(json);
      history.replaceState(null, "", location.pathname + location.search);
      return obj;
    } catch (e) {
      history.replaceState(null, "", location.pathname + location.search);
      return null;
    }
  }

  // -----------------------------------------------------------
  // دالة لرسم جدول التطبيقات وإضافة الصفوف والتفاصيل الخاصة بها
  // تبني صف رئيسي و صف تفصيلي مخفي لكل تطبيق
  // -----------------------------------------------------------
  function renderAppsTable(extraApp) {
    const apps = sampleApps.slice();
    if (extraApp) apps.push(extraApp);
    const $tbody = $("#appsTable tbody");
    if (!$tbody.length) return;
    $tbody.empty();

    $.each(apps, function (idx, a) {
      // الصف الرئيسي
      const domainsHtml = (a.domains || [])
        .slice(0, 3)
        .map(function (d) {
          return '<span class="badge">' + d + "</span>";
        })
        .join("");

      // عرض السعر
      const priceDisplay = a.price === "مدفوع" ? "مدفوع" : "مجاني";

      const $row = $(`
        <tr>
          <td>${a.name}</td>
          <td>${a.company}</td>
          <td>${domainsHtml}</td>
          <td>${priceDisplay}</td>
          <td><button class="details-btn" data-idx="${idx}">⯈</button></td>
        </tr>
      `);

      // محتوى الفيديو والرابط (باستخدام رابط التضمين المحول)
      const youtubeEmbedUrl = convertYoutubeUrl(a.youtube || "");
      const youtubeContent = youtubeEmbedUrl
        ? `<div class="detail-video"><iframe src="${youtubeEmbedUrl}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        : `<div class="detail-video"><p>لا يوجد فيديو توضيحي</p></div>`;

      // نص توضيح السعر (مطابق للكود الأصلي عند الحالة الخاصة)
      // توضيح السعر: نص مبسط يعكس خيار السعر المتاح حالياً
      const priceExplain = a.price === "مدفوع" ? "مدفوع" : "مجاني";

      // الصف التفصيلي (مبدئياً مخفي)
      const $detailRow = $(`
        <tr class="detail-row" style="display:none;">
          <td colspan="5">
            <div class="details-content">
              <div class="detail-media"><img src="${a.logo}" alt="${a.name} logo"></div>
              <div class="detail-body">
                <p><strong>الوصف:</strong> ${a.description}</p>
                <p><strong>الموقع:</strong> <a href="${a.website}" target="_blank" rel="noopener">${a.website}</a></p>
                <div class="price-explain">${priceExplain}</div>
              </div>
              ${youtubeContent}
            </div>
          </td>
        </tr>
      `);

      $tbody.append($row).append($detailRow);
    });

    // -----------------------------------------------------------
    // حدث النقر على زر التفاصيل لإظهار أو إخفاء الصف التفصيلي
    // نستخدم تبديل يدوي لضمان أن نوع العرض يكون "table-row" عند الاظهار
    // -----------------------------------------------------------
    $tbody
      .find(".details-btn")
      .off("click")
      .on("click", function () {
        const $detailRow = $(this).closest("tr").next(".detail-row");
        if (!$detailRow.length) return;
        if ($detailRow.css("display") === "none") {
          // إظهار كـ table-row للحفاظ على تنسيق الجدول
          $detailRow.css("display", "table-row");
        } else {
          $detailRow.css("display", "none");
        }
      });
  }

  // -----------------------------------------------------------
  // عند وجود جدول التطبيقات في الصفحة، نسترجع أي تطبيق مَرّر عن طريق الـ hash
  // ثم نرسم الجدول
  // -----------------------------------------------------------
  if ($("#appsTable").length) {
    const transient = getTransientAppFromHash();
    renderAppsTable(transient);
  }

  // -----------------------------------------------------------
  // معالجة نموذج إضافة تطبيق جديد (التحقق، التحويل، إعادة التوجيه مع البيانات المشفرة)
  // -----------------------------------------------------------
  if ($("#addAppForm").length) {
    $("#addAppForm").on("submit", function (e) {
      e.preventDefault();

      const name = $("#appName").val().trim();
      const company = $("#company").val().trim();
      const website = $("#website").val().trim();
      const youtube = $("#youtube").val().trim();
      const price = $('input[name="isFree"]:checked').val();
      const domains = $('input[name="domainCheckbox"]:checked')
        .map(function () {
          return $(this).val();
        })
        .get();
      const description = $("#description").val().trim();

      const errors = [];

      if (!/^[A-Za-z]+$/.test(name))
        errors.push("اسم التطبيق يجب أن يكون أحرف إنكليزية فقط وبدون فراغات.");
      if (!/^[A-Za-z]+$/.test(company))
        errors.push("اسم الشركة يجب أن يكون أحرف إنكليزية فقط.");

      // التحقق من رابط الموقع
      try {
        new URL(website);
      } catch (err) {
        errors.push("الرجاء إدخال رابط موقع صحيح.");
      }

      // التحقق من رابط اليوتيوب (إذا تم إدخاله) وتحويله إلى رابط تضمين
      let youtubeEmbedUrl = "";
      if (youtube) {
        try {
          new URL(youtube);
          youtubeEmbedUrl = convertYoutubeUrl(youtube);
        } catch (err) {
          errors.push("الرجاء إدخال رابط يوتيوب صحيح.");
        }
      }
      // اختيار مجال التطبيق 1 على الاقل ل قبول ال form
      if (domains.length < 1) errors.push("الرجاء اختيار مجال واحد على الأقل.");

      if (description.length < 10)
        errors.push("الشرح المختصر يجب أن يكون على الأقل 10 أحرف.");

      const $errorsDiv = $("#formErrors");
      if (errors.length) {
        $errorsDiv.html(
          errors
            .map(function (x) {
              return "• " + x;
            })
            .join("<br>")
        );
        return;
      } else {
        $errorsDiv.html("");
      }

      const newApp = {
        name,
        company,
        domains,
        price,
        website,
        description,
        logo: "source/custom-app.svg",
        youtube: youtubeEmbedUrl,
      };

      const json = JSON.stringify(newApp);
      const bytes = new TextEncoder().encode(json);
      const encoded = btoa(String.fromCharCode.apply(null, bytes));
      // إعادة التوجيه إلى apps.html مع البيانات في الـ hash (مشفر)
      window.location.href = "apps.html#" + encodeURIComponent(encoded);
    });
  }

  // -----------------------------------------------------------
  // التعامل مع زر تبديل التنقل (مثلاً للقائمة في الهواتف)
  // -----------------------------------------------------------
  if ($("#navToggle").length) {
    $("#navToggle").on("click", function () {
      $("#navLinks").toggleClass("show");
    });
  }
}); // نهاية ready
