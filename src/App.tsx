import { AnimatePresence, motion } from 'motion/react'
import Lenis from 'lenis'
import { useEffect, useMemo, useState } from 'react'
import { Drawer } from 'vaul'
import './App.css'
import coverImage from './assets/abaqira-cover-2026.png'
import {
  competitionRounds,
  introParagraphs,
  organizationalRules,
  penaltyAndSpeedRules,
  questionCategories,
  roundExplanations,
  tocItems,
  type QuestionItem,
} from './data/competitionData'

const pageLabels = [
  'الترحيب',
  'مقدمة الدليل',
  'اللائحة',
  'نظام المسابقة',
  'ضربات الجزاء والسرعة',
  'بنك الأسئلة',
] as const

const subtopicOrderByCategory: Record<string, string[]> = {
  science: ['الجغرافيا', 'التاريخ', 'العلوم', 'اللغة الإنجليزية'],
  arts: ['أفلام', 'ترانيم', 'أيقونات'],
}

const GOOGLE_TRANSLATE_ARTIFACT_SELECTORS = [
  '.goog-te-banner-frame',
  '.goog-te-balloon-frame',
  '.goog-te-menu-frame',
  '.goog-te-spinner-pos',
  '#goog-gt-tt',
  '.goog-text-highlight',
  'iframe[src*="translate.google"]',
  'iframe[src*="translate.googleapis"]',
].join(', ')

const GOOGLE_TRANSLATE_COOKIE_NAMES = ['googtrans', 'googtransopt'] as const
const GOOGLE_TRANSLATE_STATE_CLASSES = ['translated-ltr', 'translated-rtl'] as const

function markAsNotTranslatable(element: HTMLElement | null) {
  if (!element) {
    return
  }

  if (!element.classList.contains('notranslate')) {
    element.classList.add('notranslate')
  }

  if (element.getAttribute('translate') !== 'no') {
    element.setAttribute('translate', 'no')
  }

  if (element === document.documentElement) {
    if (element.getAttribute('lang') !== 'ar') {
      element.setAttribute('lang', 'ar')
    }

    if (element.getAttribute('dir') !== 'rtl') {
      element.setAttribute('dir', 'rtl')
    }
  }
}

function expireTranslateCookie(name: string) {
  const expiredAt = 'Thu, 01 Jan 1970 00:00:00 GMT'
  const hostnameParts = window.location.hostname.split('.').filter(Boolean)

  document.cookie = `${name}=; expires=${expiredAt}; path=/`

  for (let index = 0; index < hostnameParts.length - 1; index += 1) {
    const domain = hostnameParts.slice(index).join('.')
    document.cookie = `${name}=; expires=${expiredAt}; path=/; domain=.${domain}`
  }
}

const pageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 120 : -120,
    rotateY: direction > 0 ? 14 : -14,
    filter: 'blur(8px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      staggerChildren: 0.06,
      when: 'beforeChildren',
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -120 : 120,
    rotateY: direction > 0 ? -10 : 10,
    filter: 'blur(6px)',
    transition: { duration: 0.4 },
  }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42 },
  },
}

type QuestionCardProps = {
  item: QuestionItem
  index: number
}

type IconQuestionGroup = {
  key: string
  image: string
  imageAlt: string
  questions: QuestionItem[]
}

function QuestionCard({ item, index }: QuestionCardProps) {
  const [imageSrc, setImageSrc] = useState(item.image ?? '')
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageSrc(item.image ?? '')
    setImageFailed(false)
  }, [item.image])

  return (
    <motion.article
      layout
      variants={itemVariants}
      className="question-card question-card--open"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="question-card__title">
        <span className="question-card__index">س{index + 1}</span>
        <h3>{item.question}</h3>
      </div>

      {item.image ? (
        <div className="question-card__media">
          {imageFailed ? (
            <p className="question-card__media-fallback">تعذر تحميل الصورة. حدّث الصفحة وحاول مرة أخرى.</p>
          ) : (
            <img
              src={imageSrc}
              alt={item.imageAlt ?? `صورة السؤال ${index + 1}`}
              loading="lazy"
              onError={() => {
                if (!imageSrc) {
                  setImageFailed(true)
                  return
                }

                if (!imageSrc.includes('cb=')) {
                  const separator = imageSrc.includes('?') ? '&' : '?'
                  setImageSrc(`${imageSrc}${separator}cb=1`)
                  return
                }

                setImageFailed(true)
              }}
            />
          )}
        </div>
      ) : null}

      <motion.div
        className="answer-box"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <p>{item.answer}</p>
      </motion.div>
    </motion.article>
  )
}

type IconQuestionCardProps = {
  group: IconQuestionGroup
  index: number
}

function IconQuestionCard({ group, index }: IconQuestionCardProps) {
  const [imageSrc, setImageSrc] = useState(group.image)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageSrc(group.image)
    setImageFailed(false)
  }, [group.image])

  return (
    <motion.article
      layout
      variants={itemVariants}
      className="icon-question-card"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    >
      <div className="icon-question-card__header">
        <span className="question-card__index">أيقونة {index + 1}</span>
        <h3>{group.imageAlt}</h3>
      </div>

      <div className="icon-question-card__media">
        {imageFailed ? (
          <p className="question-card__media-fallback">تعذر تحميل الصورة. حدّث الصفحة وحاول مرة أخرى.</p>
        ) : (
          <img
            src={imageSrc}
            alt={group.imageAlt}
            loading="lazy"
            onError={() => {
              if (!imageSrc) {
                setImageFailed(true)
                return
              }

              if (!imageSrc.includes('cb=')) {
                const separator = imageSrc.includes('?') ? '&' : '?'
                setImageSrc(`${imageSrc}${separator}cb=1`)
                return
              }

              setImageFailed(true)
            }}
          />
        )}
      </div>

      <div className="icon-question-card__qa-list">
        {group.questions.map((item, questionIndex) => (
          <div key={`${group.key}-q-${questionIndex}`} className="icon-question-card__qa">
            <h4>
              س{questionIndex + 1}: {item.question}
            </h4>
            <p>ج: {item.answer}</p>
          </div>
        ))}
      </div>
    </motion.article>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [categoryId, setCategoryId] = useState(questionCategories[0]?.id ?? '')
  const [activeSubtopic, setActiveSubtopic] = useState('')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const selectedCategory = useMemo(
    () => questionCategories.find((category) => category.id === categoryId) ?? questionCategories[0],
    [categoryId],
  )

  const categorySubtopics = useMemo(() => {
    if (!selectedCategory) {
      return [] as string[]
    }

    const preferredOrder = subtopicOrderByCategory[selectedCategory.id]
    if (!preferredOrder) {
      return [] as string[]
    }

    const subtopicsFromData = Array.from(
      new Set(selectedCategory.questions.map((question) => question.subtopic).filter(Boolean)),
    ) as string[]

    return preferredOrder
      .filter((topic) => subtopicsFromData.includes(topic) || selectedCategory.id === 'arts')
      .concat(subtopicsFromData.filter((topic) => !preferredOrder.includes(topic)))
  }, [selectedCategory])

  const visibleQuestions = useMemo(() => {
    if (!selectedCategory) {
      return [] as QuestionItem[]
    }

    if (categorySubtopics.length === 0) {
      return selectedCategory.questions
    }

    if (!activeSubtopic) {
      return [] as QuestionItem[]
    }

    return selectedCategory.questions.filter((question) => question.subtopic === activeSubtopic)
  }, [activeSubtopic, categorySubtopics.length, selectedCategory])

  const iconQuestionGroups = useMemo(() => {
    if (selectedCategory?.id !== 'arts' || activeSubtopic !== 'أيقونات') {
      return [] as IconQuestionGroup[]
    }

    const grouped = new Map<string, IconQuestionGroup>()

    visibleQuestions.forEach((item) => {
      const imageKey = item.image ?? `${item.question}-${item.answer}`
      const existingGroup = grouped.get(imageKey)

      if (existingGroup) {
        existingGroup.questions.push(item)
        return
      }

      grouped.set(imageKey, {
        key: imageKey,
        image: item.image ?? '',
        imageAlt: item.imageAlt ?? 'أيقونة قديس',
        questions: [item],
      })
    })

    return Array.from(grouped.values())
  }, [activeSubtopic, selectedCategory?.id, visibleQuestions])

  useEffect(() => {
    if (categorySubtopics.length === 0) {
      if (activeSubtopic !== '') {
        setActiveSubtopic('')
      }
      return
    }

    if (!activeSubtopic || !categorySubtopics.includes(activeSubtopic)) {
      const firstSubtopicWithQuestions =
        categorySubtopics.find((topic) =>
          selectedCategory?.questions.some((question) => question.subtopic === topic),
        ) ?? categorySubtopics[0]
      setActiveSubtopic(firstSubtopicWithQuestions)
    }
  }, [activeSubtopic, categorySubtopics, selectedCategory])

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = window.requestAnimationFrame(raf)
    }

    rafId = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    let isCleaning = false

    const protectFromTranslation = () => {
      if (isCleaning) {
        return
      }

      isCleaning = true

      try {
        ;[
          document.documentElement,
          document.body,
          document.getElementById('root'),
          document.querySelector('.app-shell'),
        ].forEach((element) => {
          if (element instanceof HTMLElement) {
            markAsNotTranslatable(element)
          }
        })

        GOOGLE_TRANSLATE_COOKIE_NAMES.forEach(expireTranslateCookie)

        ;[document.documentElement, document.body].forEach((element) => {
          GOOGLE_TRANSLATE_STATE_CLASSES.forEach((className) => {
            if (element.classList.contains(className)) {
              element.classList.remove(className)
            }
          })

          if (element.style.top) {
            element.style.removeProperty('top')
          }
        })

        document.querySelectorAll<HTMLElement>(GOOGLE_TRANSLATE_ARTIFACT_SELECTORS).forEach((element) => {
          if (!element.closest('#root')) {
            element.remove()
          }
        })
      } finally {
        isCleaning = false
      }
    }

    protectFromTranslation()

    const observer = new MutationObserver(() => {
      protectFromTranslation()
    })

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const progress = ((currentPage + 1) / pageLabels.length) * 100
  const currentPageLabel = pageLabels[currentPage]
  const mobileTriggerLabel = currentPage === 0 ? 'الصفحة الرئيسية' : currentPageLabel

  const moveToPage = (targetPage: number) => {
    const safePage = Math.max(0, Math.min(pageLabels.length - 1, targetPage))
    if (safePage === currentPage) {
      setIsMobileNavOpen(false)
      return
    }

    setDirection(safePage > currentPage ? 1 : -1)
    setCurrentPage(safePage)
    setIsMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    if (currentPage === 0) {
      return (
        <motion.div className="hero-grid" variants={itemVariants} initial="hidden" animate="show">
          <motion.div className="hero-copy" variants={itemVariants}>
            <p className="hero-kicker">الموسم الخامس</p>
            <h1>اهلا بكم في مسابقه العباقره الموسم الخامس</h1>
            <p className="hero-year">2026</p>
            <button type="button" className="primary-btn" onClick={() => moveToPage(1)}>
              ابدأ المسابقة
            </button>
          </motion.div>

          <motion.div className="hero-media" variants={itemVariants}>
            <img src={coverImage} alt="غلاف دليل العباقرة" />
          </motion.div>
        </motion.div>
      )
    }

    if (currentPage === 1) {
      return (
        <div className="stack">
          <motion.section className="glass-card" variants={itemVariants}>
            <h2>مقدمة الدليل</h2>
            <div className="paragraphs">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.section>

          <motion.section className="glass-card" variants={itemVariants}>
            <h2>فهرس الموضوعات</h2>
            <div className="toc-grid">
              {tocItems.map((item) => (
                <div key={item.topic} className="toc-item">
                  <span>{item.topic}</span>
                  <span>ص {item.page}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      )
    }

    if (currentPage === 2) {
      return (
        <motion.section className="glass-card" variants={itemVariants}>
          <h2>اللائحة التنظيمية للمسابقة</h2>
          <ul className="rules-list">
            {organizationalRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </motion.section>
      )
    }

    if (currentPage === 3) {
      return (
        <div className="stack">
          <motion.section className="glass-card" variants={itemVariants}>
            <h2>نظام المسابقة</h2>
            <div className="rounds-grid">
              {competitionRounds.map((round) => (
                <article key={round.title} className="round-card">
                  <h3>{round.title}</h3>
                  <div className="chips">
                    {round.items.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </motion.section>

          <motion.section className="glass-card" variants={itemVariants}>
            <h2>شرح بنود الفقرات</h2>
            <div className="explain-grid">
              {roundExplanations.map((section) => (
                <article key={section.title} className="explain-card">
                  <h3>{section.title}</h3>
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </motion.section>
        </div>
      )
    }

    if (currentPage === 4) {
      return (
        <motion.section className="glass-card" variants={itemVariants}>
          <h2>ضربات الجزاء + أسئلة السرعة</h2>
          <div className="explain-grid">
            {penaltyAndSpeedRules.map((section) => (
              <article key={section.title} className="explain-card">
                <h3>{section.title}</h3>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.section>
      )
    }

    return (
      <div className="stack">
        <motion.section className="glass-card" variants={itemVariants}>
          <h2>بنك الأسئلة</h2>
          <p className="section-note">
            تم تجهيز بنوك الأسئلة في ملفات منفصلة لكل فقرة، والإجابات ظاهرة مباشرة للتدريب.
          </p>
          <div className="category-tabs">
            {questionCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setCategoryId(category.id)
                  setActiveSubtopic('')
                }}
                className={`tab ${category.id === selectedCategory?.id ? 'tab--active' : ''}`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {categorySubtopics.length > 0 ? (
            <div className="science-subtopics">
              <p className="science-subtopics__label">
                {selectedCategory?.id === 'science' ? 'اختيارات فقرة العلم' : 'اختيارات فقرة الفنون'}
              </p>
              <div className="category-tabs">
                {categorySubtopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveSubtopic(topic)}
                    className={`tab ${activeSubtopic === topic ? 'tab--active' : ''}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.section>

        {selectedCategory ? (
          <motion.section className="glass-card" variants={itemVariants}>
            <h2>{selectedCategory.title}</h2>
            <p className="section-note">{selectedCategory.description}</p>
            {categorySubtopics.length > 0 && visibleQuestions.length === 0 ? (
              <p className="section-note">لا توجد أسئلة مضافة في هذا الاختيار الآن.</p>
            ) : null}
            {selectedCategory.id === 'arts' && activeSubtopic === 'أيقونات' ? (
              <div className="icon-question-grid">
                {iconQuestionGroups.map((group, index) => (
                  <IconQuestionCard key={`${selectedCategory.id}-${group.key}`} group={group} index={index} />
                ))}
              </div>
            ) : (
              <div className="question-grid">
                {visibleQuestions.map((item, index) => (
                  <QuestionCard key={`${selectedCategory.id}-${index}`} item={item} index={index} />
                ))}
              </div>
            )}
          </motion.section>
        ) : null}
      </div>
    )
  }

  return (
    <div className="app-shell notranslate" dir="rtl" translate="no">
      <div className="bg-orb bg-orb--one" />
      <div className="bg-orb bg-orb--two" />
      <div className="bg-grid" />

      <header className="app-header">
        <div className="brand">
          <strong>مسابقه العباقره 2026</strong>
        </div>
        <div className="progress-area">
          <span>
            المرحلة {currentPage + 1} / {pageLabels.length}
          </span>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <Drawer.Root direction="right" open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <Drawer.Trigger asChild>
          <button type="button" className="mobile-nav-trigger" aria-label="فتح قائمة المراحل">
            <span className="mobile-nav-trigger__label">{mobileTriggerLabel}</span>
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="mobile-drawer-overlay" />
          <Drawer.Content className="mobile-drawer-content" dir="rtl">
            <div className="mobile-drawer-head">
              <h3>التنقل بين المراحل</h3>
              <Drawer.Close asChild>
                <button type="button" className="mobile-drawer-close" aria-label="إغلاق قائمة المراحل">
                  ×
                </button>
              </Drawer.Close>
            </div>

            <div className="mobile-drawer-list">
              {pageLabels.map((label, index) => (
                <button
                  key={`mobile-${label}`}
                  type="button"
                  className={`mobile-drawer-item ${index === currentPage ? 'mobile-drawer-item--active' : ''}`}
                  onClick={() => moveToPage(index)}
                >
                  <span className="mobile-drawer-item__label">{label}</span>
                  <span className="mobile-drawer-item__meta">{index === currentPage ? 'أنت هنا' : index + 1}</span>
                </button>
              ))}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <nav className="page-nav" aria-label="مراحل المسابقة">
        {pageLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`page-dot ${index === currentPage ? 'page-dot--active' : ''}`}
            onClick={() => moveToPage(index)}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="page-stage">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={currentPage}
            className="page-panel"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderPage()}
          </motion.section>
        </AnimatePresence>
      </main>

    </div>
  )
}

export default App
