// iOS Widget für Task Reminder
// Funktioniert nur mit Development Build!

import WidgetKit
import SwiftUI

struct TaskReminderWidget: Widget {
    let kind: String = "TaskReminderWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TaskReminderWidgetView(entry: entry)
        }
        .configurationDisplayName("Task Reminder")
        .description("Zeigt deine nächste Task mit Erinnerung")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> TaskEntry {
        TaskEntry(date: Date(), task: TaskData(
            title: "Joggen",
            time: "15:00",
            color: "#6E5CF6",
            minutesUntil: 15
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (TaskEntry) -> ()) {
        let entry = TaskEntry(date: Date(), task: TaskData(
            title: "Joggen",
            time: "15:00",
            color: "#6E5CF6",
            minutesUntil: 15
        ))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        // Hier würden wir die Tasks aus der App holen
        // Für jetzt: Beispiel-Daten
        let currentDate = Date()
        let entry = TaskEntry(date: currentDate, task: TaskData(
            title: "Joggen",
            time: "15:00",
            color: "#6E5CF6",
            minutesUntil: 15
        ))

        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct TaskEntry: TimelineEntry {
    let date: Date
    let task: TaskData
}

struct TaskData {
    let title: String
    let time: String
    let color: String
    let minutesUntil: Int
}

struct TaskReminderWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            // Background mit Task-Farbe
            Color(hex: entry.task.color)
                .opacity(0.2)

            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Image(systemName: "bell.fill")
                        .foregroundColor(Color(hex: entry.task.color))
                    Text("ERINNERUNG")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.secondary)
                    Spacer()
                }

                Spacer()

                // Task Info
                VStack(alignment: .leading, spacing: 4) {
                    Text("in \(entry.task.minutesUntil) Min")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(Color(hex: entry.task.color))

                    Text(entry.task.title)
                        .font(.headline)
                        .fontWeight(.bold)
                        .lineLimit(2)

                    HStack {
                        Image(systemName: "clock.fill")
                            .font(.caption2)
                        Text(entry.task.time)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundColor(.secondary)
                }

                Spacer()
            }
            .padding()
        }
    }
}

// Helper: Hex Color zu SwiftUI Color
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

@main
struct TaskReminderWidgetBundle: WidgetBundle {
    var body: some Widget {
        TaskReminderWidget()
    }
}
