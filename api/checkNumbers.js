//api/checkNumbers.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { groups } = req.body;

    let allNumbers = new Set();
    let duplicates = new Set();
    let totalUsedNumbers = new Set();
    let groupResults = [];
    let flatNumbers = [];

    // ステップ 2: 各グループを処理
    groups.forEach((group, index) => {
      const { range, expectedCount } = group;

      // ナンバリング文字列をパースして、すべての番号を配列化
      const numbers = parseRangeString(range);
      flatNumbers = flatNumbers.concat(numbers);

      // 冊数チェック
      const actualCount = numbers.length;
      const isCountOK = actualCount === expectedCount;

      groupResults.push(`📝 グループ${index + 1}：入力 ${expectedCount}冊 / 実際 ${actualCount}冊 → ${isCountOK ? "✅ OK" : "❌ エラー"}`);

      // 重複チェック
      numbers.forEach(num => {
        if (allNumbers.has(num)) {
          duplicates.add(num);
        } else {
          allNumbers.add(num);
        }
      });
    });

    // ステップ 3: 結果まとめて返す
    const dupMessage = duplicates.size > 0
      ? `⚠️ 重複あり：${[...duplicates].sort((a,b)=>a-b).join(", ")}`
      : "✅ 重複なし";

    const finalMessage = [...groupResults, "", dupMessage].join("\n");

    return res.status(200).json({ message: finalMessage });
  } catch (error) {
    console.error("処理中のエラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}

// ステップ 4: 文字列から番号を展開する関数（例: "1-3,5,7-9" → [1,2,3,5,7,8,9]）
function parseRangeString(str) {
  const cleaned = str.replace(/　/g, " ").replace(/\s+/g, ","); // 全角→半角＋スペース→カンマ
  const parts = cleaned.split(",").map(s => s.trim()).filter(Boolean);

  const numbers = [];
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      numbers.push(Number(part));
    } else if (/^(\d+)-(\d+)$/.test(part)) {
      const [_, start, end] = part.match(/^(\d+)-(\d+)$/);
      const s = Number(start);
      const e = Number(end);
      if (s <= e) {
        for (let i = s; i <= e; i++) {
          numbers.push(i);
        }
      }
    }
  }
  return numbers;
}
