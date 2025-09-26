const dayjs = require("dayjs");
// Import controllers
const {
  getServiceNowTable,
} = require("../../controllers/servicenow_controllers");

// Functions for get data structure used in ServiceNow dashboard
/**
 * Valor numérico	Estado (UI)
 *      1	        New
 *      2	        In Progress
 *      3	        On Hold
 *      6	        Resolved
 *      7	        Closed
 *      8	        Canceled
 */

// Tickets already open - Non closed and none canceled
exports.getOpenedTickets = async (req, res) => {
  try {
    const tickets = await getServiceNowTable(
      "incident?sysparm_query=state!=7^state!=8"
    );
    return tickets;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOpenedTicketsPerMonth = async (req, res) => {
  try {
    const tickets = await getServiceNowTable(
      "incident?sysparm_query=state!=7^state!=8"
    );
    const cleanTickets = transformTickets(tickets);
    return cleanTickets;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NUMBER of Tickets already open - Non closed and none canceled
exports.getNumberOpenedTickets = async (req, res) => {
  try {
    const tickets = await getServiceNowTable(
      "incident?sysparm_query=state!=7^state!=8"
    );
    // Post process
    const numberOfTickets = tickets.length;
    return numberOfTickets;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mean Time to Resolution
exports.getMeanTimeToResolution = async (req, res) => {
  try {
    const incidents = await getServiceNowTable(
      "incident?sysparm_fields=sys_id,opened_at,closed_at,resolved_at&sysparm_query=resolved_atISNOTEMPTY"
    );

    if (!incidents.length) {
      console.log("There's no resolved incidents.");
      return null;
    }

    let totalTiempo = 0;
    let count = 0;

    incidents.forEach((inc) => {
      if (inc.opened_at && inc.resolved_at) {
        const opened = new Date(inc.opened_at);
        const resolved = new Date(inc.resolved_at);

        const diffHoras = (resolved - opened) / (1000 * 60 * 60); // Difference un hours
        totalTiempo += diffHoras;
        count++;
      }
    });

    const mttr = totalTiempo / count;
    console.log(`MTTR: ${mttr.toFixed(2)} horas basado en ${count} incidentes`);

    return Math.round(mttr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// All the opened tasks
exports.getOpenedTasks = async (req, res) => {
  try {
    const allTasks = await getServiceNowTable(
      "task?sysparm_query=state!=7^state!=8"
    );

    return allTasks;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Documented tasks
exports.getDocumentedTask = async (req, res) => {
  const { taskID } = req.body;
  try {
    const documentedTask = await getServiceNowTable(
      `task_sla?sysparm_query=task=${taskID}`
    );

    return documentedTask;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Backlog
exports.getBacklog = async (req, res) => {
  try {
    const tickets = await getServiceNowTable("incident?sysparm_query=state!=7");
    // Post process
    const numberOfTickets = tickets.length;
    return numberOfTickets;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PLA per month
exports.getTicketsPercentage = async (req, res) => {
  try {
    const slaResp = await getServiceNowTable(
      "task_sla?sysparm_query=stage!=cancelled^stage!=paused&sysparm_fields=stage,end_time,start_time&sysparm_limit=10000"
    );

    const results = slaResp;

    // Group by start_time
    const summary = {};

    results.forEach((sla) => {
      const month = dayjs(sla.start_time).format("YYYY-MM");
      if (!summary[month]) {
        summary[month] = { total: 0, achieved: 0, breached: 0 };
      }

      summary[month].total++;

      if (sla.stage === "achieved") {
        summary[month].achieved++;
      } else if (sla.stage === "breached") {
        summary[month].breached++;
      }
    });

    // %PLA per month
    const PLAmonth = Object.entries(summary).map(([month, data]) => ({
      month,
      PLA: ((data.achieved / data.total) * 100).toFixed(2),
      Achieved: data.achieved,
      Breached: data.breached,
      Total: data.total,
    }));

    console.log(PLAmonth);

    return PLAmonth;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Functions
function transformTickets(tickets) {
  return tickets.map((ticket) => {
    const openedDate = new Date(ticket.opened_at);
    const month = `${openedDate.getFullYear()}-${String(
      openedDate.getMonth() + 1
    ).padStart(2, "0")}`;

    return {
      number: ticket.number,
      opened_at: ticket.opened_at,
      month,
      priority: ticket.priority,
      state: ticket.state,
      severity: ticket.severity,
      urgency: ticket.urgency,
      category: ticket.category,
      assignment_group: ticket.assignment_group?.value || null,
    };
  });
}
