# HyperVerse Node Agent

The HyperVerse Node Agent runs on each virtualization host and provides QEMU/KVM orchestration plus real-time host and VPS statistics.

## Capabilities

- Validates local KVM, `virsh`, and `qemu-img` availability through `GET /health`.
- Lists libvirt domains and exposes per-domain runtime metrics.
- Creates qcow2-backed guests with `qemu-img` and `virt-install`.
- Starts, gracefully stops, reboots, destroys, and undefines domains through REST or Socket.io commands.
- Publishes `node:stats` every `STATS_INTERVAL_MS` milliseconds to the backend agent gateway.

## Requirements

Install QEMU/KVM, libvirt, and virt-install on the host running the agent. The agent process user must be able to access `/dev/kvm` and manage libvirt domains.

```bash
sudo apt-get install qemu-kvm libvirt-daemon-system libvirt-clients virtinst qemu-utils
sudo usermod -aG libvirt,kvm $USER
```

## Configuration

```bash
cp .env.example .env
npm install
npm run dev
```

The backend and agent must share the same `AGENT_TOKEN`. The backend accepts this token for node-agent Socket.io connections and forwards agent telemetry to connected administrators.

## REST API

- `GET /health` checks KVM and libvirt readiness.
- `GET /stats` returns host CPU, memory, disk, network, and domain metrics.
- `GET /vps` lists libvirt domains.
- `GET /vps/:name/stats` returns one domain's metrics.
- `POST /vps/action` runs a VPS action. Supported actions are `create`, `start`, `stop`, `restart`, `destroy`, and `delete`.
