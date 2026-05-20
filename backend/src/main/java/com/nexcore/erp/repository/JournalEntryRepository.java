package com.nexcore.erp.repository;

import com.nexcore.erp.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findAllByOrderByDateDesc();
}
