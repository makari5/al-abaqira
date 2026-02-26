#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import math
import random
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = PROJECT_ROOT / "public" / "observation-images"
OUTPUT_JSON = PROJECT_ROOT / "src" / "data" / "questions" / "observation-power.json"

OBJECT_TYPES = [
    ("star", "النجوم"),
    ("triangle", "المثلثات"),
    ("square", "المربعات"),
    ("circle", "الدوائر"),
    ("heart", "القلوب"),
    ("smile", "الوجوه المبتسمة"),
    ("arrow", "الأسهم"),
    ("diamond", "المعينات"),
    ("plus", "علامات الزائد"),
    ("moon", "الأهلة"),
]

PALETTE = [
    "#60A5FA",  # blue
    "#F87171",  # red
    "#34D399",  # green
    "#FBBF24",  # yellow
    "#A78BFA",  # purple
    "#22D3EE",  # cyan
    "#FB7185",  # rose
    "#F97316",  # orange
    "#4ADE80",  # lime
    "#C084FC",  # violet
]


def difficulty_specs(level: str) -> tuple[tuple[int, int], tuple[int, int]]:
    if level == "سهل":
        return (4, 7), (16, 22)
    if level == "متوسط":
        return (8, 12), (24, 30)
    return (13, 18), (32, 40)


def star_points(outer_r: float, inner_r: float) -> str:
    points = []
    for i in range(10):
        angle = -math.pi / 2 + i * (math.pi / 5)
        radius = outer_r if i % 2 == 0 else inner_r
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        points.append(f"{x:.2f},{y:.2f}")
    return " ".join(points)


def shape_svg(shape: str, size: float, color: str, panel_color: str) -> str:
    half = size * 0.5
    if shape == "circle":
        return f'<circle cx="0" cy="0" r="{half:.2f}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'

    if shape == "square":
        side = size * 0.92
        hs = side / 2
        return f'<rect x="{-hs:.2f}" y="{-hs:.2f}" width="{side:.2f}" height="{side:.2f}" rx="{size * 0.10:.2f}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'

    if shape == "triangle":
        h = size * 0.96
        p1 = f"0,{-h * 0.58:.2f}"
        p2 = f"{h * 0.52:.2f},{h * 0.40:.2f}"
        p3 = f"{-h * 0.52:.2f},{h * 0.40:.2f}"
        return f'<polygon points="{p1} {p2} {p3}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'

    if shape == "star":
        points = star_points(size * 0.55, size * 0.24)
        return f'<polygon points="{points}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'

    if shape == "diamond":
        p1 = f"0,{-half:.2f}"
        p2 = f"{half:.2f},0"
        p3 = f"0,{half:.2f}"
        p4 = f"{-half:.2f},0"
        return f'<polygon points="{p1} {p2} {p3} {p4}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'

    if shape == "plus":
        long_side = size * 0.95
        thick = size * 0.28
        h_long = long_side / 2
        h_thick = thick / 2
        return (
            f'<rect x="{-h_long:.2f}" y="{-h_thick:.2f}" width="{long_side:.2f}" height="{thick:.2f}" rx="{h_thick:.2f}" fill="{color}" />'
            f'<rect x="{-h_thick:.2f}" y="{-h_long:.2f}" width="{thick:.2f}" height="{long_side:.2f}" rx="{h_thick:.2f}" fill="{color}" />'
        )

    if shape == "arrow":
        s = size
        pts = [
            (-0.50 * s, -0.18 * s),
            (0.08 * s, -0.18 * s),
            (0.08 * s, -0.38 * s),
            (0.55 * s, 0),
            (0.08 * s, 0.38 * s),
            (0.08 * s, 0.18 * s),
            (-0.50 * s, 0.18 * s),
        ]
        points = " ".join(f"{x:.2f},{y:.2f}" for x, y in pts)
        return f'<polygon points="{points}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" />'

    if shape == "heart":
        r = size * 0.24
        y = size * 0.08
        path = (
            f"M 0 {size * 0.42:.2f} "
            f"C {-size * 0.55:.2f} {size * 0.05:.2f}, {-size * 0.60:.2f} {-size * 0.35:.2f}, {-r:.2f} {-y:.2f} "
            f"C {-size * 0.02:.2f} {-size * 0.42:.2f}, {size * 0.02:.2f} {-size * 0.42:.2f}, {r:.2f} {-y:.2f} "
            f"C {size * 0.60:.2f} {-size * 0.35:.2f}, {size * 0.55:.2f} {size * 0.05:.2f}, 0 {size * 0.42:.2f} Z"
        )
        return f'<path d="{path}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" />'

    if shape == "moon":
        outer = size * 0.50
        inner = size * 0.42
        shift = size * 0.20
        return (
            f'<circle cx="0" cy="0" r="{outer:.2f}" fill="{color}" />'
            f'<circle cx="{shift:.2f}" cy="{(-size * 0.02):.2f}" r="{inner:.2f}" fill="{panel_color}" />'
        )

    # smile
    face_r = size * 0.50
    eye_r = size * 0.08
    eye_dx = size * 0.18
    eye_dy = -size * 0.12
    mouth_w = size * 0.38
    mouth_y = size * 0.14
    return (
        f'<circle cx="0" cy="0" r="{face_r:.2f}" fill="{color}" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" />'
        f'<circle cx="{-eye_dx:.2f}" cy="{eye_dy:.2f}" r="{eye_r:.2f}" fill="#1F2937" />'
        f'<circle cx="{eye_dx:.2f}" cy="{eye_dy:.2f}" r="{eye_r:.2f}" fill="#1F2937" />'
        f'<path d="M {-mouth_w:.2f} {mouth_y:.2f} Q 0 {size * 0.34:.2f} {mouth_w:.2f} {mouth_y:.2f}" fill="none" stroke="#1F2937" stroke-width="2.2" stroke-linecap="round" />'
    )


def build_svg(index: int, target_shape: str, target_count: int, total_count: int, rng: random.Random) -> str:
    width, height = 960, 600
    panel_color = "#0B1A34"
    margin_x, margin_y = 52, 70
    cols, rows = 12, 8
    step_x = (width - (2 * margin_x)) / (cols - 1)
    step_y = (height - (2 * margin_y)) / (rows - 1)

    points = []
    for r in range(rows):
        for c in range(cols):
            x = margin_x + (c * step_x)
            y = margin_y + (r * step_y)
            points.append((x, y))

    chosen_points = rng.sample(points, total_count)
    target_indices = set(rng.sample(range(total_count), target_count))

    distractors = [shape for shape, _ in OBJECT_TYPES if shape != target_shape]
    rng.shuffle(distractors)
    active_distractors = distractors[: rng.randint(3, 6)]

    parts = []
    for i, (x, y) in enumerate(chosen_points):
        shape = target_shape if i in target_indices else rng.choice(active_distractors)
        color = rng.choice(PALETTE)
        size = rng.uniform(28, 42)
        dx = rng.uniform(-8, 8)
        dy = rng.uniform(-8, 8)
        rotation = rng.uniform(-28, 28) if shape not in {"smile", "moon"} else rng.uniform(-8, 8)
        content = shape_svg(shape, size, color, panel_color)
        parts.append(
            f'<g transform="translate({x + dx:.2f} {y + dy:.2f}) rotate({rotation:.2f})">{content}</g>'
        )

    objects_svg = "\n    ".join(parts)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <linearGradient id="bg{index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <filter id="shadow{index}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="rgba(0,0,0,0.36)" />
    </filter>
  </defs>

  <rect width="{width}" height="{height}" fill="url(#bg{index})" />
  <rect x="24" y="24" width="{width - 48}" height="{height - 48}" rx="20" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.22)" />
  <g filter="url(#shadow{index})">
    {objects_svg}
  </g>
</svg>
"""


def main() -> None:
    rng = random.Random(2026)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    for old in IMAGE_DIR.glob("observation-*.svg"):
        old.unlink()

    difficulties = (["سهل"] * 120) + (["متوسط"] * 60) + (["صعب"] * 20)
    rng.shuffle(difficulties)

    questions = []

    for i in range(1, 201):
        difficulty = difficulties[i - 1]
        (target_min, target_max), (total_min, total_max) = difficulty_specs(difficulty)
        target_shape, target_label = OBJECT_TYPES[(i - 1) % len(OBJECT_TYPES)]

        target_count = rng.randint(target_min, target_max)
        total_count = rng.randint(max(total_min, target_count + 8), total_max)

        svg = build_svg(i, target_shape, target_count, total_count, rng)
        filename = f"observation-{i:03}.svg"
        (IMAGE_DIR / filename).write_text(svg, encoding="utf-8")

        questions.append(
            {
                "question": f"انظر إلى الصورة جيدًا: كم عدد {target_label}؟",
                "answer": str(target_count),
                "difficulty": difficulty,
                "subtopic": "عدّ العناصر المتنوعة",
                "image": f"/observation-images/{filename}",
                "imageAlt": f"صورة قوة الملاحظة رقم {i}",
            }
        )

    if len(questions) != 200:
        raise ValueError(f"Expected 200 questions, got {len(questions)}")

    diff_counts = Counter(q["difficulty"] for q in questions)
    expected_diff = {"سهل": 120, "متوسط": 60, "صعب": 20}
    if dict(diff_counts) != expected_diff:
        raise ValueError(f"Difficulty mismatch: {diff_counts}")

    type_counts = Counter(q["question"].split("عدد ")[1].rstrip("؟") for q in questions)
    expected_each_type = 20
    for _, label in OBJECT_TYPES:
        if type_counts[label] != expected_each_type:
            raise ValueError(f"Type distribution mismatch for {label}: {type_counts[label]}")

    payload = {
        "id": "observation-power",
        "title": "قوة الملاحظة",
        "description": "200 سؤال بصري بصور متنوعة (نجوم، مثلثات، وجوه، قلوب، أسهم وغيرها) مع إجابات عدّ دقيقة.",
        "questions": questions,
    }

    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Generated images:", len(list(IMAGE_DIR.glob("observation-*.svg"))))
    print("Generated questions:", len(questions))
    print("Difficulty:", dict(diff_counts))
    print("Object types:", dict(type_counts))
    print("JSON:", OUTPUT_JSON)


if __name__ == "__main__":
    main()
