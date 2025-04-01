import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

type RepeatOption = "매일" | "매주" | "매월" | "매년";
type EndOption = "없음" | "횟수" | "날짜";

interface RepeatSelectorProps {
  onChange?: (option: RepeatOption) => void;
  selectedDate?: Date;  // 사용자가 선택한 날짜
}

// 요일 매핑 (일=0 ~ 토=6)
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 특정 달의 마지막 날 (예: 3월=2 => new Date(year, 3, 0))
function getLastDayOfMonth(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  // month+1, day=0 -> 해당 달의 마지막 날짜
  return new Date(y, m + 1, 0).getDate();
}

// 이 날짜가 해당 달에 "몇 번째 요일"인지 (ex. 네 번째 금요일)
function getNthWeekdayOfMonth(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const targetDow = date.getDay(); // 0~6
  const targetDay = date.getDate();

  let count = 0;
  // 1일부터 date일까지 loop
  const d = new Date(y, m, 1);
  while (d <= date) {
    if (d.getDay() === targetDow) {
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// 이 날짜가 "마지막 해당 요일"인지
function isLastWeekdayOfMonth(date: Date): boolean {
  const next = new Date(date);
  next.setDate(date.getDate() + 7); // 일주일 뒤
  // 다음 주 같은 요일이 달을 넘어가면 => 마지막 요일
  return next.getMonth() !== date.getMonth();
}

const RepeatSelector: React.FC<RepeatSelectorProps> = ({
  onChange,
  selectedDate,
}) => {
  const [selectedRepeat, setSelectedRepeat] = useState<RepeatOption>("매일");
  const [endOption, setEndOption] = useState<EndOption>("없음");
  // 매일 반복 주기
  const [repeatCount, setRepeatCount] = useState<string>("30");
  // 매주 반복 주기
  const [repeatWeek, setRepeatWeek] = useState<string>("1");
  // 매년 반복 주기
  const [repeatYear, setRepeatYear] = useState<string>("1");
  // 반복 종료일 날짜
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>("");

  // 매주 반복: 요일들
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    월: false,
    화: false,
    수: false,
    목: false,
    금: false,
    토: false,
    일: false,
  });

  // "매월"일 때 선택할 월간 패턴 (예: "매월 XX일", "매월 N번째 YY요일", ...)
  const [monthlyOption, setMonthlyOption] = useState<string>("");

  // 반복 주기 선택
  const handleSelectRepeat = (option: RepeatOption) => {
    setSelectedRepeat(option);
    onChange?.(option);
  };

  // 요일 토글 (매주)
  const toggleDay = (day: string) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // 날짜 선택 (반복 종료일)
  const handleConfirmEndDate = (date: Date) => {
    setEndDatePickerVisible(false);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayNum = date.getDate();
    const formatted = `${year}년 ${month}월 ${dayNum}일`;
    setEndDate(formatted);
  };

  // ------------------- "매월" 패턴 생성 로직 -------------------
  // 사용자가 특정 날짜 selectedDate를 고른 경우만 계산 (없으면 예외 처리)
  let monthlyPatternItems: Array<{ key: string; label: string }> = [];
  if (selectedDate && selectedRepeat === "매월") {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const dow = selectedDate.getDay(); // 0=일 ~6=토

    // 1) 매월 {day}일
    const dayOfMonthLabel = `매월 ${day}일`;
    monthlyPatternItems.push({ key: "dayOfMonth", label: dayOfMonthLabel });

    // 2) 매월 N번째 요일
    const nth = getNthWeekdayOfMonth(selectedDate); // ex. 4
    const nthWeekdayLabel = `매월 ${nth}번째 ${WEEKDAYS[dow]}요일`;
    monthlyPatternItems.push({ key: "nthWeekday", label: nthWeekdayLabel });

    // 3) 만약 달의 마지막 날이면 => "매월 말일"
    const lastDay = getLastDayOfMonth(selectedDate);
    if (day === lastDay) {
      monthlyPatternItems.push({ key: "lastDay", label: "매월 말일" });
    }

    // 4) 만약 달의 마지막 해당 요일이면 => "매월 마지막 요일"
    if (isLastWeekdayOfMonth(selectedDate)) {
      monthlyPatternItems.push({
        key: "lastWeekday",
        label: `매월 마지막 ${WEEKDAYS[dow]}요일`,
      });
    }

    // monthlyOption이 아직 설정 안됐으면, 첫 아이템으로 설정
    if (monthlyPatternItems.length > 0 && !monthlyOption) {
      setMonthlyOption(monthlyPatternItems[0].key);
    }
  }

  return (
    <View style={styles.repeatContainer}>

      {/* 상단: 매일, 매주, 매월, 매년 */}
      <View style={styles.repeatRow}>
        <TouchableOpacity
          style={[styles.optionButton, selectedRepeat === "매일" && styles.selectedOption]}
          onPress={() => handleSelectRepeat("매일")}
        >
          <Text style={[styles.optionText, selectedRepeat === "매일" && styles.selectedOptionText]}>
            매일
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, selectedRepeat === "매주" && styles.selectedOption]}
          onPress={() => handleSelectRepeat("매주")}
        >
          <Text style={[styles.optionText, selectedRepeat === "매주" && styles.selectedOptionText]}>
            매주
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, selectedRepeat === "매월" && styles.selectedOption]}
          onPress={() => handleSelectRepeat("매월")}
        >
          <Text style={[styles.optionText, selectedRepeat === "매월" && styles.selectedOptionText]}>
            매월
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, selectedRepeat === "매년" && styles.selectedOption]}
          onPress={() => handleSelectRepeat("매년")}
        >
          <Text style={[styles.optionText, selectedRepeat === "매년" && styles.selectedOptionText]}>
            매년
          </Text>
        </TouchableOpacity>
      </View>

      {/* ------------------- 반복 주기 설정 UI ------------------- */}
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.subtitle}>반복 주기</Text>

        {/* 매일 */}
        {selectedRepeat === "매일" && (
          <Text style={styles.contentText}>매일 반복</Text>
        )}

        {/* 매주 */}
        {selectedRepeat === "매주" && (
          <View>
            <View style={{ marginVertical: 5, marginLeft: 20 }}>
              <View style={styles.countInputRow}>
                <TextInput
                  style={styles.countInput}
                  keyboardType="numeric"
                  placeholder="1"
                  value={repeatWeek}
                  onChangeText={setRepeatWeek}
                />
                <Text style={{ marginLeft: 4 }}>주마다</Text>
              </View>
            </View>
            {/* 요일 선택 */}
            <View style={styles.dayRow}>
              {DAYS.map((dayStr) => {
                const isSelected = selectedDays[dayStr];
                return (
                  <TouchableOpacity
                    key={dayStr}
                    style={[
                      styles.dayButton,
                      { backgroundColor: isSelected ? "#2962FF" : "#ccc" },
                    ]}
                    onPress={() => toggleDay(dayStr)}
                  >
                    <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                      {dayStr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 매월 */}
        {selectedRepeat === "매월" && (
          <View style={{ marginTop: 10 }}>
            {/* 여기서 selectedDate를 이용한 동적 패턴 */}
            {monthlyPatternItems.length === 0 ? (
              <Text style={{ color: "red" }}>
                날짜가 설정되지 않았거나 패턴을 계산할 수 없습니다.
              </Text>
            ) : (
              monthlyPatternItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.monthlyOptionRow}
                  onPress={() => setMonthlyOption(item.key)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {monthlyOption === item.key && (
                    <MaterialIcons name="check" size={20} color="#2962FF" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* 매년 */}
        {selectedRepeat === "매년" && (
          <View style={{ marginVertical: 5, marginLeft: 20 }}>
          <View style={styles.countInputRow}>
            <TextInput
              style={styles.countInput}
              keyboardType="numeric"
              placeholder="1"
              value={repeatYear}
              onChangeText={setRepeatYear}
            />
            <Text style={{ marginLeft: 4 }}>년마다</Text>
          </View>
          </View>             
        )}
      </View>

      {/* ------------------- 반복 종료일 (세로) ------------------- */}
      <Text style={styles.subtitle}>반복 종료일</Text>

      {/* 없음 */}
      <TouchableOpacity style={styles.endOptionBtn} onPress={() => setEndOption("없음")}>
        <View style={styles.rowBetween}>
          <Text style={styles.optionText}>없음</Text>
          {endOption === "없음" && <MaterialIcons name="check" size={20} color="#2962FF" />}
        </View>
      </TouchableOpacity>

      {/* 횟수 */}
      <TouchableOpacity style={styles.endOptionBtn} onPress={() => setEndOption("횟수")}>
        <View style={styles.rowBetween}>
          <Text style={styles.optionText}>횟수</Text>
          {endOption === "횟수" && <MaterialIcons name="check" size={20} color="#2962FF" />}
        </View>
      </TouchableOpacity>
      {endOption === "횟수" && (
        <View style={{marginLeft: 20 }}>
          <View style={styles.countInputRow}>
            <TextInput
              style={styles.countInput}
              keyboardType="numeric"
              placeholder="횟수 입력"
              value={repeatCount}
              onChangeText={setRepeatCount}
            />
            <Text style={{ marginLeft: 4 }}>회</Text>
          </View>
        </View>
      )}

      {/* 날짜 */}
      <TouchableOpacity style={styles.endOptionBtn} onPress={() => setEndOption("날짜")}>
        <View style={styles.rowBetween}>
          <Text style={styles.optionText}>날짜 선택</Text>
          {endOption === "날짜" && <MaterialIcons name="check" size={20} color="#2962FF" />}
        </View>
      </TouchableOpacity>
      {endOption === "날짜" && (
        <View style={{ marginLeft: 20 }}>
          <TouchableOpacity
            style={styles.dateSelectButton}
            onPress={() => setEndDatePickerVisible(true)}
          >
            <Text style={{ color: "#fff" }}>날짜 선택하기</Text>
          </TouchableOpacity>
          {endDate ? (
            <Text style={{ marginTop: 5 }}>선택된 날짜: {endDate}</Text>
          ) : null}
        </View>
      )}

      {/* 날짜 모달 */}
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={() => setEndDatePickerVisible(false)}
        display="inline"
      />
    </View>
  );
};

export default RepeatSelector;

// --------------------- 스타일 ----------------------
const styles = StyleSheet.create({
  repeatContainer: {
    padding: 5,
    borderColor: "#ccc",
    borderRadius: 5,
    borderWidth: 1,
  },
  repeatRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  selectedOption: {
    backgroundColor: "#2962FF",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contentText: {
    fontSize: 16,
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },

  // 매주 반복 - 요일 선택
  dayRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  dayButton: {
    marginRight: 5,
    paddingHorizontal:"4%",
    paddingVertical: "4%",
    borderRadius: 5,
  },

  // 반복 종료일
  endOptionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 5,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  // 횟수
  countInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  countInput: {
    width: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    textAlign: "left",
  },

  // 날짜 선택
  dateSelectButton: {
    backgroundColor: "#2962FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 5,
  },

  // 월간 옵션
  monthlyOptionRow: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
});
