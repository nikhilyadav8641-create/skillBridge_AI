
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import './ProgressChart.css'

function ProgressChart({
  completedTasks = 0,
  pendingTasks = 0,
}) {
  const progressData = [
    { status: 'Completed', tasks: completedTasks },
    { status: 'Remaining', tasks: pendingTasks },
  ]

  return (
    <div className="progress-chart-card">
      <div className="progress-chart-header">
        <div>
          <h3>Learning Progress</h3>
          <p>Your roadmap task completion</p>
        </div>

        <span className="progress-chart-badge">
          {completedTasks + pendingTasks} Total Tasks
        </span>
      </div>

      <div className="progress-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={progressData}>
            <defs>
              <linearGradient
                id="progressFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="#2563eb"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="status"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={35}
              label={{
                value: 'Tasks',
                angle: -90,
                position: 'insideLeft',
              }}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="tasks"
              name="Learning tasks"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#progressFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ProgressChart