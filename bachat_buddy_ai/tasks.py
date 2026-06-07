from crewai import Task

def create_tasks(auditor, strategist, coach, setu_json):
    
    audit_data = Task(
        description=f"Analyze the following Setu Sandbox JSON: {setu_json}. Identify total income, total expenses, and list any recurring subscriptions found.",
        expected_output="A summarized table of income vs expenses and a list of detected subscriptions.",
        agent=auditor
    )

    create_plan = Task(
        description="Using the audit summary, calculate how much the user *should* be saving and identify one 'big win' (a specific expense category to cut).",
        expected_output="A breakdown of the 50/30/20 rule applied to the user's current income.",
        agent=strategist,
        context=[audit_data] # Feeds Auditor output into Strategist
    )

    write_summary = Task(
        description="Write a 3-sentence message to the user. Sentence 1: A compliment on their current balance. Sentence 2: The biggest saving opportunity. Sentence 3: A clear next step.",
        expected_output="A friendly 3-sentence actionable summary.",
        agent=coach,
        context=[create_plan] # Feeds Strategist output into Coach
    )

    return [audit_data, create_plan, write_summary]